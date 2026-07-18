import json
import time
import hashlib
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from typing import Optional, Dict, Any

from config.config import settings
from repositories.analysis_repository import analysis_repository
from repositories.transaction_repository import transaction_repository
from repositories.notification_repository import notification_repository
from services.dashboard_service import dashboard_service
from services.notification_service import notification_service
from services.metrics_service import metrics_service
from utils.logging import logger

class AIService:
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def _compute_signature(self, txs: list) -> str:
        """Computes a sha256 content signature of the transaction set to enable caching."""
        # Sort key fields to ensure consistent hashes regardless of database read order
        sorted_txs = sorted(
            txs,
            key=lambda x: (x.get("date", ""), x.get("merchant", ""), x.get("amount", 0.0), x.get("type", ""))
        )
        sig_str = "".join(
            f"{t.get('date', '')}|{t.get('merchant', '')}|{t.get('amount', 0.0)}|{t.get('type', '')}"
            for t in sorted_txs
        )
        return hashlib.sha256(sig_str.encode("utf-8")).hexdigest()

    def run_financial_analysis(self, uid: str, company_id: Optional[str]) -> Dict[str, Any]:
        if company_id in ["null", "undefined", ""]:
            company_id = None

        logger.info(f"Starting Gemini Financial Analysis for user {uid}")
        notification_service.update_pipeline_status(uid, "Sending")
        
        # Gather data from repositories
        txs = transaction_repository.list_transactions(uid, company_id)
        
        if not txs:
            logger.info(f"No transactions found for user {uid}. Skipping AI Analysis.")
            notification_service.update_pipeline_status(uid, "Analysis Complete")
            return {
                "analysis": {
                    "summary": "No transaction records found to compile AI CFO recommendations.",
                    "businessHealth": "Unknown",
                    "risks": [],
                    "opportunities": [],
                    "recommendations": [],
                    "forecast": {}
                },
                "confidenceScore": 0.0,
                "error": "No transaction records found."
            }

        # Calculate dataset signature
        txs_hash = self._compute_signature(txs)
        logger.info(f"Current Gemini Model: gemini-1.5-flash")
        logger.info(f"Current Transaction Signature: {txs_hash}")
        
        # Check Signature Cache
        try:
            latest = analysis_repository.get_latest_analysis(uid, company_id)
            is_usable_cache = (
                latest is not None
                and latest.get("signature") == txs_hash
                and latest.get("error") is None
                and latest.get("confidenceScore", 0) > 0
                and isinstance(latest.get("analysis", {}), dict)
            )
            if is_usable_cache:
                logger.info(f"Cache Hit: reusing matching analysis for user {uid} (sig: {txs_hash})")
                notification_service.update_pipeline_status(uid, "Analysis Complete")
                try:
                    notification_service.send_report_notification(uid, company_id)
                except Exception as notif_err:
                    logger.error(f"Error in automatic notification dispatch: {str(notif_err)}")
                return latest

            if latest is not None:
                reason = "stale or invalid"
                if latest.get("signature") != txs_hash:
                    reason = "signature mismatch"
                elif latest.get("error") is not None:
                    reason = "stored error analysis"
                elif latest.get("confidenceScore", 0) <= 0:
                    reason = "invalid confidence score"
                logger.info(f"Cache Miss: ignoring cached analysis for user {uid} ({reason})")
        except Exception as cache_err:
            logger.warning(f"Failed to check analysis signature cache: {str(cache_err)}")

        summary = dashboard_service.get_overview(uid, company_id)
        
        # Limit transactions sent to prompt to avoid token limit issues
        sample_txs = txs[:80]
        
        prompt = f"""
Analyze the following business financial data as an expert AI CFO.
Generate a structured JSON output with detailed insights.

=========================
FINANCIAL SUMMARY:
=========================
{summary}

=========================
TRANSACTIONS SAMPLE:
=========================
{sample_txs}

You MUST return a JSON object with this exact schema:
{{
  "summary": "string - Detailed executive summary of company health.",
  "businessHealth": "string - Good, Stable, or Critical based on trends.",
  "risks": [
    {{
      "risk": "string - Risk description",
      "severity": "string - Low, Medium, or High",
      "financialImpact": "string - Estimated monetary or business impact",
      "recommendation": "string - Strategic advice to mitigate"
    }}
  ],
  "opportunities": [
    {{
      "opportunity": "string - Opportunity description",
      "estimatedFinancialImpact": "string - Projected financial benefit",
      "difficulty": "string - Easy, Medium, or Hard",
      "expectedROI": "string - Expected return on investment"
    }}
  ],
  "recommendations": [
    {{
      "priority": "string - Immediate, 30 Days, 90 Days, or Long Term",
      "action": "string - Actionable step description"
    }}
  ],
  "forecast": {{
    "August": "number - estimated revenue",
    "September": "number - estimated revenue",
    "October": "number - estimated revenue"
  }}
}}

Ensure no markdown backticks block the response. Output only valid JSON.
"""

        logger.info(f"Generating New Analysis for user {uid} (sig: {txs_hash})")

        # Execute API call with Exponential Backoff Retry logic
        raw_text = None
        max_retries = 3
        backoff_delay = 2.0
        generation_config = {
            "temperature": 0.2,
            "response_mime_type": "application/json"
        }

        for attempt in range(max_retries):
            start_ai = time.time()
            try:
                response = self.model.generate_content(prompt, generation_config=generation_config)
                raw_text = response.text.strip()
                metrics_service.record("gemini_latency", time.time() - start_ai)
                break
            except Exception as gemini_err:
                logger.warning(f"Gemini API attempt {attempt+1} failed: {str(gemini_err)}")
                if attempt == max_retries - 1:
                    logger.error("Gemini API retries exhausted. Failing gracefully.")
                    notification_service.update_pipeline_status(uid, "Failed")
                    # Return fallback
                    return self._generate_fallback_analysis(uid, company_id, str(gemini_err), txs_hash)
                time.sleep(backoff_delay)
                backoff_delay *= 2

        # Clean JSON markdown if wrapped
        if raw_text.startswith("```"):
            lines = raw_text.split("\n")
            if lines[0].startswith("```json") or lines[0].startswith("```"):
                raw_text = "\n".join(lines[1:-1]).strip()
        
        try:
            parsed_json = json.loads(raw_text)
        except json.JSONDecodeError as jde:
            logger.error(f"JSON Parsing Error from Gemini output: {str(jde)}")
            return self._generate_fallback_analysis(uid, company_id, f"Invalid JSON payload: {str(jde)}", txs_hash)

        # Persist the analysis results
        doc_data = {
            "analysis": parsed_json,
            "confidenceScore": 95.0,
            "signature": txs_hash,
            "error": None
        }
        
        try:
            logger.info(f"Saving Analysis for user {uid} (sig: {txs_hash})")
            saved_analysis = analysis_repository.save_analysis(uid, company_id, doc_data)
            
            # Trigger custom business notifications based on AI analysis
            self._generate_notifications_from_analysis(uid, parsed_json)
            
            # Save final analysis completion status before running service
            notification_service.update_pipeline_status(uid, "Analysis Complete")
            
            # Dispatch report notification (safe call)
            try:
                notification_service.send_report_notification(uid, company_id)
            except Exception as notif_err:
                logger.error(f"Error in automatic notification dispatch: {str(notif_err)}")
                
            logger.info(f"Returning Cached Analysis for user {uid} (sig: {txs_hash})")
            return saved_analysis
        except Exception as save_err:
            logger.error(f"Failed to save completed analysis to Firestore: {str(save_err)}")
            raise save_err

    def _generate_fallback_analysis(self, uid: str, company_id: Optional[str], error_msg: str, signature: str) -> Dict[str, Any]:
        """Generates and records a fallback analysis document when Gemini fails."""
        fallback_analysis = {
            "summary": f"An error occurred while compiling AI insights: {error_msg}",
            "businessHealth": "Error",
            "risks": [
                {
                    "risk": f"AI analysis generation failed: {error_msg}",
                    "severity": "Critical",
                    "financialImpact": "Blocked",
                    "recommendation": "Check API credentials or rate limits."
                }
            ],
            "opportunities": [],
            "recommendations": [],
            "forecast": {},
            "error": error_msg
        }
        doc_data = {
            "analysis": fallback_analysis,
            "confidenceScore": 0.0,
            "signature": signature,
            "error": error_msg
        }
        return analysis_repository.save_analysis(uid, company_id, doc_data)

    def ask_ai_question(self, uid: str, company_id: Optional[str], question: str) -> str:
        # Get context
        txs = transaction_repository.list_transactions(uid, company_id)
        summary = dashboard_service.get_overview(uid, company_id)
        history = analysis_repository.list_chat_history(uid, company_id)
        
        # Build prompt context
        history_str = ""
        for chat in history[-5:]: # Last 5 chat messages
            history_str += f"User: {chat.get('question')}\nCFO: {chat.get('answer')}\n"
            
        prompt = f"""
You are the company's AI Chief Financial Officer (AI CFO).
Context:
Transactions: {txs[:40]}
Financial Summary: {summary}

Chat History:
{history_str}

User Question: {question}

Provide a helpful, precise, and professional CFO response in Markdown. Do not answer questions unrelated to finance/business.
"""
        try:
            start_ai = time.time()
            response = self.model.generate_content(prompt)
            metrics_service.record("gemini_latency", time.time() - start_ai)
            answer = response.text.strip()
        except Exception as e:
            logger.error(f"Gemini Chat execution failed: {e}")
            answer = "I'm sorry, I'm having trouble connecting to my cognitive networks. Please try again in a moment."
            
        # Save Q&A to history
        analysis_repository.save_chat_message(uid, company_id, question, answer)
        return answer

    def _generate_notifications_from_analysis(self, uid: str, analysis: Dict[str, Any]):
        risks = analysis.get("risks", [])
        recs = analysis.get("recommendations", [])
        
        for r in risks[:2]: # Max 2 risk notifications
            severity = r.get("severity", "Medium").lower()
            notif_type = "error" if severity == "critical" or severity == "high" else "warning"
            notification_repository.create_notification(
                uid=uid,
                title=f"Risk: {r.get('risk')[:40]}",
                description=f"Impact: {r.get('financialImpact')}. Recommendation: {r.get('recommendation')}",
                type=notif_type
            )
            
        for rec in recs[:1]: # Max 1 recommendation alert
            notification_repository.create_notification(
                uid=uid,
                title=f"Recommendation: {rec.get('action')[:40]}",
                description=f"Priority Action Item: {rec.get('action')}",
                type="success"
            )

ai_service = AIService()

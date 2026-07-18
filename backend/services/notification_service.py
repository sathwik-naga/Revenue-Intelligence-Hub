import os
import time
import smtplib
import requests
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from typing import Optional, Dict, Any

from config.config import settings
from utils.firebase import get_firestore
from firebase_admin import auth as firebase_auth
from repositories.analysis_repository import analysis_repository
from services.dashboard_service import dashboard_service
from utils.logging import logger

class NotificationService:
    def __init__(self):
        self.notifications_collection = "notifications"
        self.pipeline_status_collection = "pipeline_status"

    def _db(self):
        return get_firestore()

    def update_pipeline_status(self, uid: str, status: str):
        """Updates the current notification/analysis pipeline status for a user."""
        try:
            coll = self._db().collection(self.pipeline_status_collection)
            doc_ref = coll.document(uid)
            doc_ref.set({
                "uid": uid,
                "status": status,
                "updatedAt": datetime.utcnow().isoformat()
            })
            logger.info(f"Pipeline status updated to '{status}' for user {uid}")
        except Exception as e:
            logger.error(f"Failed to update pipeline status to '{status}' for user {uid}: {str(e)}")

    def get_pipeline_status(self, uid: str) -> str:
        """Retrieves the current notification/analysis pipeline status for a user."""
        try:
            coll = self._db().collection(self.pipeline_status_collection)
            doc = coll.document(uid).get()
            if doc.exists:
                return doc.to_dict().get("status", "Analysis Complete")
            return "Analysis Complete"
        except Exception as e:
            logger.error(f"Failed to get pipeline status for user {uid}: {str(e)}")
            return "Analysis Complete"

    def get_user_preferences(self, uid: str) -> Dict[str, Any]:
        """Loads notification preferences from users/{uid} document under 'notificationSettings' field."""
        default_preferences = {
            "emailEnabled": True,
            "whatsappEnabled": False,
            "weeklySummary": True,
            "aiAlerts": True,
            "expenseAlerts": True,
            "profitAlerts": True,
            "csvCompleted": True,
            "whatsappNumber": ""
        }
        try:
            doc_ref = self._db().collection("users").document(uid)
            doc = doc_ref.get()
            if doc.exists:
                data = doc.to_dict()
                settings_map = data.get("notificationSettings", {})
                # Merge with defaults
                merged = {**default_preferences, **settings_map}
                return merged
            return default_preferences
        except Exception as e:
            logger.error(f"Failed to load preferences for user {uid}: {str(e)}")
            return default_preferences

    def save_user_preferences(self, uid: str, preferences: Dict[str, Any]) -> bool:
        """Saves user notification settings inside users/{uid} document under 'notificationSettings'."""
        try:
            doc_ref = self._db().collection("users").document(uid)
            # Create user document if it doesn't exist, or merge settings
            doc_ref.set({"notificationSettings": preferences}, merge=True)
            logger.info(f"Notification preferences saved for user {uid}")
            return True
        except Exception as e:
            logger.error(f"Failed to save preferences for user {uid}: {str(e)}")
            return False

    def list_history(self, uid: str) -> list:
        """Lists notification history for the specified user."""
        try:
            docs = self._db().collection(self.notifications_collection).where("uid", "==", uid).stream()
            results = [doc.to_dict() for doc in docs]
            return sorted(results, key=lambda x: x.get("createdAt", ""), reverse=True)
        except Exception as e:
            logger.error(f"Failed to load notification history for user {uid}: {str(e)}")
            return []

    def _log_notification_history(self, uid: str, title: str, channel: str, recipient: str, status: str, error: Optional[str] = None, start_time: float = 0.0):
        """Creates a record in notifications collection."""
        try:
            delivery_time_ms = int((time.time() - start_time) * 1000) if start_time > 0 else 0
            coll = self._db().collection(self.notifications_collection)
            doc_ref = coll.document()
            doc_data = {
                "id": doc_ref.id,
                "uid": uid,
                "title": title,
                "type": "alert", # generic alert type
                "channel": channel,
                "recipient": recipient,
                "status": status,
                "createdAt": datetime.utcnow().isoformat(),
                "deliveredAt": datetime.utcnow().isoformat() if status == "delivered" else None,
                "error": error,
                "deliveryTimeMs": delivery_time_ms
            }
            doc_ref.set(doc_data)
        except Exception as e:
            logger.error(f"Failed to log notification history for user {uid}: {str(e)}")

    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Sends email using Resend API (preferred) or SMTP (fallback). Runs with retry once."""
        resend_key = settings.RESEND_API_KEY
        
        # Determine sender email
        from_email = settings.SMTP_FROM_EMAIL or "no-reply@revenue-intelligence.com"
        
        def attempt():
            if resend_key:
                # Use Resend API
                headers = {
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "from": f"Revenue Hub AI <{from_email}>" if "@" in from_email else from_email,
                    "to": to_email,
                    "subject": subject,
                    "html": html_content
                }
                res = requests.post("https://api.resend.com/emails", json=payload, headers=headers, timeout=10)
                if res.status_code >= 400:
                    raise Exception(f"Resend API error (status {res.status_code}): {res.text}")
                return True
            else:
                # Fallback to SMTP
                host = settings.SMTP_HOST
                port = settings.SMTP_PORT
                username = settings.SMTP_USERNAME
                password = settings.SMTP_PASSWORD
                
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = from_email
                msg['To'] = to_email
                
                part = MIMEText(html_content, 'html')
                msg.attach(part)
                
                if port == 465:
                    server = smtplib.SMTP_SSL(host, port, timeout=10)
                else:
                    server = smtplib.SMTP(host, port, timeout=10)
                    if port == 587:
                        server.starttls()
                        
                if username and password:
                    server.login(username, password)
                    
                server.sendmail(from_email, to_email, msg.as_string())
                server.quit()
                return True

        # Try once, retry once
        try:
            return attempt()
        except Exception as e1:
            logger.warning(f"First email send attempt failed: {str(e1)}. Retrying in 1s...")
            time.sleep(1.0)
            try:
                return attempt()
            except Exception as e2:
                logger.error(f"All email send attempts failed: {str(e2)}")
                raise e2

    def send_whatsapp(self, to_number: str, message: str) -> bool:
        """Sends WhatsApp message using Twilio. Runs with retry once."""
        account_sid = settings.TWILIO_ACCOUNT_SID
        auth_token = settings.TWILIO_AUTH_TOKEN
        from_number = settings.TWILIO_WHATSAPP_NUMBER or "whatsapp:+14155238886"

        if not account_sid or not auth_token:
            logger.warning("Twilio credentials missing. Skipping WhatsApp delivery.")
            return False

        if not to_number:
            logger.warning("No WhatsApp recipient number configured. Skipping WhatsApp delivery.")
            return False

        # Normalize number format
        if not to_number.startswith("whatsapp:"):
            to_number = f"whatsapp:{to_number}"

        def attempt():
            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            auth = (account_sid, auth_token)
            payload = {
                "From": from_number,
                "To": to_number,
                "Body": message
            }
            res = requests.post(url, auth=auth, data=payload, timeout=10)
            if res.status_code >= 400:
                raise Exception(f"Twilio API error (status {res.status_code}): {res.text}")
            return True

        # Try once, retry once
        try:
            return attempt()
        except Exception as e1:
            logger.warning(f"First WhatsApp send attempt failed: {str(e1)}. Retrying in 1s...")
            time.sleep(1.0)
            try:
                return attempt()
            except Exception as e2:
                logger.error(f"All WhatsApp send attempts failed: {str(e2)}")
                raise e2

    def send_report_notification(self, uid: str, company_id: Optional[str]) -> bool:
        """Automatically triggers the notification pipeline after AI Analysis completes."""
        logger.info(f"Beginning notification workflow for user {uid}")
        
        # Load Preferences
        prefs = self.get_user_preferences(uid)
        
        # Check if notifications enabled at all
        email_enabled = prefs.get("emailEnabled", True)
        whatsapp_enabled = prefs.get("whatsappEnabled", False)
        
        if not email_enabled and not whatsapp_enabled:
            logger.info(f"Notifications disabled for user {uid}. Workflow finished.")
            self.update_pipeline_status(uid, "Analysis Complete")
            return True

        # Retrieve analysis details
        latest_analysis = analysis_repository.get_latest_analysis(uid, company_id)
        if not latest_analysis:
            logger.warning(f"No analysis found for user {uid}. Cannot send notification.")
            self.update_pipeline_status(uid, "Failed")
            return False

        analysis_payload = latest_analysis.get("analysis", {})
        
        # Retrieve overview metrics
        summary = dashboard_service.get_overview(uid, company_id)
        health_score = summary.get("healthScore", 95)
        health_label = summary.get("healthLabel", "Stable")
        
        # Query health score if not in summary yet
        if "healthScore" not in summary:
            health = dashboard_service.get_health(uid, company_id)
            health_score = health.get("healthScore", 95)
            health_label = health.get("healthLabel", "Stable")

        # Format values
        revenue_val = summary.get("totalRevenue", 0)
        expenses_val = summary.get("totalExpenses", 0)
        profit_val = summary.get("netProfit", 0)

        fmt_rev = f"₹{revenue_val:,.0f}"
        fmt_exp = f"₹{expenses_val:,.0f}"
        fmt_prof = f"₹{profit_val:,.0f}"
        fmt_health = f"{health_score}% ({health_label})"

        # User details from Auth SDK
        try:
            user_record = firebase_auth.get_user(uid)
            recipient_email = user_record.email
            user_name = user_record.display_name or recipient_email.split("@")[0]
        except Exception as auth_err:
            logger.warning(f"Could not retrieve user info from Firebase Auth: {str(auth_err)}")
            recipient_email = "owner@revenuehub.com"
            user_name = "Business Owner"

        generated_date = datetime.utcnow().strftime("%B %d, %Y")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

        email_title = "Financial Analysis Ready"
        whatsapp_title = "Financial Analysis Completed Summary"

        # 1. SEND EMAIL
        email_sent_successfully = False
        if email_enabled and recipient_email:
            start_time = time.time()
            subject = f"📊 Executive Summary - Revenue Hub [{generated_date}]"
            if not settings.RESEND_API_KEY and not settings.SMTP_USERNAME:
                logger.warning("Email delivery skipped: SMTP/Resend credentials are not configured.")
                self._log_notification_history(
                    uid=uid,
                    title=email_title,
                    channel="email",
                    recipient=recipient_email,
                    status="skipped",
                    error="Email delivery skipped: credentials not configured.",
                    start_time=start_time
                )
                self.update_pipeline_status(uid, "Analysis Complete")
                email_sent_successfully = True
            else:
                try:
                    self.send_email(recipient_email, subject, html_body)
                    email_sent_successfully = True
                    self._log_notification_history(
                        uid=uid,
                        title=email_title,
                        channel="email",
                        recipient=recipient_email,
                        status="delivered",
                        start_time=start_time
                    )
                    logger.info(f"Email notification successfully sent to {recipient_email}")
                except Exception as email_err:
                    email_sent_successfully = False
                    self._log_notification_history(
                        uid=uid,
                        title=email_title,
                        channel="email",
                        recipient=recipient_email,
                        status="failed",
                        error=f"Email delivery failed: {str(email_err)}",
                        start_time=start_time
                    )
                    logger.error(f"Email delivery pipeline failed: {str(email_err)}")
            
            # Format risks & recommendations list items
            risks_html = ""
            for r in analysis_payload.get("risks", [])[:3]:
                risks_html += f"""
                <li style="margin-bottom: 8px;">
                  <strong style="color: #ef4444;">[{r.get('severity', 'Medium')}] {r.get('risk')}</strong>
                  <br/><span style="font-size: 12px; color: #94a3b8;">Impact: {r.get('financialImpact')} &bull; Advice: {r.get('recommendation')}</span>
                </li>
                """
            if not risks_html:
                risks_html = "<li>No significant risks identified.</li>"

            recs_html = ""
            for rec in analysis_payload.get("recommendations", [])[:3]:
                recs_html += f"""
                <li style="margin-bottom: 6px;">
                  <strong style="color: #3b82f6;">[{rec.get('priority', 'Medium')}]</strong> {rec.get('action')}
                </li>
                """
            if not recs_html:
                recs_html = "<li>No recommendation actions compiled yet.</li>"

            forecast_html = ""
            for month, amt in analysis_payload.get("forecast", {}).items():
                try:
                    forecast_html += f"<tr><td style='padding: 6px 0; border-bottom: 1px solid #1e293b; color: #94a3b8;'>{month}</td><td style='padding: 6px 0; border-bottom: 1px solid #1e293b; text-align: right; font-weight: bold; color: #ffffff;'>₹{float(amt):,.0f}</td></tr>"
                except:
                    forecast_html += f"<tr><td style='padding: 6px 0; border-bottom: 1px solid #1e293b; color: #94a3b8;'>{month}</td><td style='padding: 6px 0; border-bottom: 1px solid #1e293b; text-align: right; font-weight: bold; color: #ffffff;'>{amt}</td></tr>"
            if not forecast_html:
                forecast_html = "<tr><td colspan='2' style='color: #94a3b8;'>No forecast periods available.</td></tr>"

            # Beautiful dark Neon Aurora styled HTML template
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Revenue Hub Summary</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #f8fafc;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 40px; background: linear-gradient(135deg, #1e3a8a, #0d9488); text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #ffffff;">REVENUE HUB</h1>
                    <p style="margin: 5px 0 0 0; font-size: 11px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase;">Enterprise AI CFO Report</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px;">
                    <p style="margin: 0; font-size: 16px; font-weight: 500; color: #94a3b8;">Hello {user_name},</p>
                    <p style="margin: 10px 0 30px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                      Your financial ledger statements have been parsed, and the AI CFO Analytics engine has compiled your monthly executive report.
                    </p>
                    
                    <!-- KPI Cards Grid -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                      <tr>
                        <td width="48%" style="padding: 16px; background-color: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 16px;">
                          <span style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Total Revenue</span>
                          <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #06b6d4;">{fmt_rev}</h2>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="padding: 16px; background-color: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 16px;">
                          <span style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Total Expenses</span>
                          <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #ef4444;">{fmt_exp}</h2>
                        </td>
                      </tr>
                      <tr style="height: 16px;"><td></td></tr>
                      <tr>
                        <td width="48%" style="padding: 16px; background-color: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 16px;">
                          <span style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Net Income / Profit</span>
                          <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #10b981;">{fmt_prof}</h2>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="padding: 16px; background-color: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 16px;">
                          <span style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Business Health</span>
                          <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #10b981;">{fmt_health}</h2>
                        </td>
                      </tr>
                    </table>

                    <!-- AI Insights -->
                    <div style="padding: 20px; background-color: rgba(255,255,255,0.02); border: 1px solid #1e293b; border-radius: 16px; margin-bottom: 30px;">
                      <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">AI Executive Summary</h4>
                      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                        {analysis_payload.get('summary', 'No summary available.')}
                      </p>
                    </div>

                    <!-- AI Recommendations -->
                    <div style="margin-bottom: 30px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #ffffff;">Top CFO Recommendations</h3>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                        {recs_html}
                      </ul>
                    </div>

                    <!-- Risks -->
                    <div style="margin-bottom: 30px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #ffffff;">Audited Financial Risks</h3>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                        {risks_html}
                      </ul>
                    </div>

                    <!-- Forecast -->
                    <div style="margin-bottom: 40px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #ffffff;">Revenue Forecast Projection</h3>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                        {forecast_html}
                      </table>
                    </div>

                    <!-- Button -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="{frontend_url}/dashboard" style="display: inline-block; padding: 14px 30px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #ffffff; background: linear-gradient(to right, #2563eb, #0891b2); border-radius: 12px; text-decoration: none; box-shadow: 0 8px 20px rgba(37,99,235,0.3);">Open Console Dashboard</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #1e293b; background-color: rgba(0,0,0,0.2);">
                    <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: bold;">
                      Generated automatically by Revenue Hub AI
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 10px; color: #475569;">
                      Report Date: {generated_date} &bull; User ID: {uid}
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """
            
            try:
                self.send_email(recipient_email, subject, html_body)
                email_sent_successfully = True
                self._log_notification_history(
                    uid=uid,
                    title=email_title,
                    channel="email",
                    recipient=recipient_email,
                    status="delivered",
                    start_time=start_time
                )
                logger.info(f"Email notification successfully sent to {recipient_email}")
            except Exception as email_err:
                email_sent_successfully = False
                self._log_notification_history(
                    uid=uid,
                    title=email_title,
                    channel="email",
                    recipient=recipient_email,
                    status="failed",
                    error=f"Email delivery failed: {str(email_err)}",
                    start_time=start_time
                )
                logger.error(f"Email delivery pipeline failed: {str(email_err)}")

        # 2. SEND WHATSAPP
        whatsapp_sent_successfully = False
        whatsapp_number = prefs.get("whatsappNumber", "")
        if whatsapp_enabled and whatsapp_number:
            start_time = time.time()
            
            # Format top insights
            top_insight = "Marketing or operational expenses need auditing."
            if analysis_payload.get("recommendations"):
                top_insight = analysis_payload.get("recommendations")[0].get("action")
            
            whatsapp_body = f"""📊 *Revenue Hub*

Your financial analysis has completed.

*Revenue*
{fmt_rev}

*Expenses*
{fmt_exp}

*Profit*
{fmt_prof}

*Business Health*
{health_score}%

*Top Insight*
{top_insight}

*Open Dashboard*
{frontend_url}/dashboard
"""
            try:
                sent = self.send_whatsapp(whatsapp_number, whatsapp_body)
                if sent:
                    whatsapp_sent_successfully = True
                    self._log_notification_history(
                        uid=uid,
                        title=whatsapp_title,
                        channel="whatsapp",
                        recipient=whatsapp_number,
                        status="delivered",
                        start_time=start_time
                    )
                    logger.info(f"WhatsApp notification successfully sent to {whatsapp_number}")
                else:
                    whatsapp_sent_successfully = False
                    self._log_notification_history(
                        uid=uid,
                        title=whatsapp_title,
                        channel="whatsapp",
                        recipient=whatsapp_number,
                        status="failed",
                        error="Twilio send failure: credentials or setup issue.",
                        start_time=start_time
                    )
            except Exception as wa_err:
                whatsapp_sent_successfully = False
                self._log_notification_history(
                    uid=uid,
                    title=whatsapp_title,
                    channel="whatsapp",
                    recipient=whatsapp_number,
                    status="failed",
                    error=f"WhatsApp delivery failed: {str(wa_err)}",
                    start_time=start_time
                )
                logger.error(f"WhatsApp delivery pipeline failed: {str(wa_err)}")

        # Update global pipeline status based on results
        if email_enabled:
            if email_sent_successfully:
                self.update_pipeline_status(uid, "Email Sent")
            else:
                self.update_pipeline_status(uid, "Failed")
        else:
            self.update_pipeline_status(uid, "Analysis Complete")

        return True

notification_service = NotificationService()

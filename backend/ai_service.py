import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
    "temperature": 0.3,
    "top_p": 0.9,
    "top_k": 40,
    "max_output_tokens": 4096,
}

model = genai.GenerativeModel(
    "gemini-1.5-flash",
    generation_config=generation_config,
)


def analyze_financials(transactions, summary):
    prompt = f"""
You are a world-class AI Chief Financial Officer (AI CFO).

Analyze the following business financial data like Deloitte, PwC, McKinsey, or a senior financial consultant.

=========================
FINANCIAL SUMMARY
=========================
{summary}

=========================
TRANSACTIONS
=========================
{transactions}

Generate a comprehensive financial report.

IMPORTANT FORMAT RULES:

# 📊 Financial Health Report

## 🏥 Executive Summary
Give a short overview of the company's financial condition.

---

## 💯 Business Health Score
- Score: **__/100**
- Explain why.

---

## ⚠ Top Financial Risks

For each risk provide:

- Risk
- Severity (Low / Medium / High)
- Financial Impact
- Recommendation

---

## 💰 Revenue Analysis

Include:
- Revenue sources
- Top customers
- Revenue concentration
- Revenue trends
- Growth percentage

---

## 💸 Expense Analysis

Include:
- Largest expense categories
- Expense trends
- Cost optimization opportunities
- Wasted spending

---

## 📈 Cash Flow Forecast

Forecast the next 3 months.

Present it as a table:

| Month | Forecast | Confidence |
|--------|----------|------------|

---

## 🚀 Growth Opportunities

Provide at least 5 opportunities.

Each should include:

- Opportunity
- Estimated financial impact
- Difficulty
- Expected ROI

---

## ✅ Prioritized Action Plan

Create a numbered action list.

Priority:
- Immediate
- 30 Days
- 90 Days
- Long Term

---

## 🎯 Final AI Recommendation

Summarize the business in one executive paragraph.

IMPORTANT:

Use proper GitHub Markdown.

Use:
# Heading
## Heading
### Heading

Use bullet lists.

Use numbered lists.

Use tables.

Bold important values.

Never return JSON.

Never explain that you are an AI.

Sound like a professional CFO.
"""

    


    response = model.generate_content(prompt)

    print("\n================ GEMINI RESPONSE ================\n")
    print(response.text)
    print("\n===============================================\n")

    return {
        "analysisText": response.text,
        "confidenceScore": 95,
        "insights": [
            {
                "id": "1",
                "type": "recommendation",
                "title": "Reduce Cloud Costs",
                "description": "Optimize AWS usage to reduce monthly infrastructure expenses.",
                "severity": "warning",
                "status": "active",
                "impactAmount": 2500,
                "confidenceScore": 94
            },
            {
                "id": "2",
                "type": "prediction",
                "title": "Revenue Growth Expected",
                "description": "Projected revenue growth of approximately 8% next month.",
                "severity": "info",
                "status": "active",
                "impactAmount": 12000,
                "confidenceScore": 92
            },
            {
                "id": "3",
                "type": "anomaly",
                "title": "Customer Concentration Risk",
                "description": "More than 50% of revenue comes from one client.",
                "severity": "critical",
                "status": "active",
                "impactAmount": 50000,
                "confidenceScore": 97
            }
        ]
    }
def ask_ai(question, transactions, summary):
    prompt = f"""
You are the company's AI Chief Financial Officer.

Financial Summary:
{summary}

Transactions:
{transactions}

User Question:
{question}

Answer using GitHub Markdown.

Rules:
- Give a direct answer.
- Use bullet points when appropriate.
- Perform calculations if needed.
- Reference the provided transaction data.
- If the user asks for predictions, estimate based on the available data.
- If the user asks for recommendations, prioritize them by impact.
- Keep the response professional, concise, and actionable.
"""

    response = model.generate_content(prompt)

    return response.text
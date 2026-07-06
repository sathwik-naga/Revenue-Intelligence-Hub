# 📊 Revenue Intelligence Hub

An AI-powered financial analytics platform that transforms raw business transaction data into actionable financial insights using **Google Gemini AI**, **React**, **FastAPI**, and **Firebase**.

---

## 🚀 Overview

Revenue Intelligence Hub helps businesses make smarter financial decisions by automatically analyzing transaction data, generating AI-powered financial reports, forecasting cash flow, identifying financial risks, and providing personalized recommendations through an interactive AI financial advisor.

---

## 🚀 Demo Access

Option 1:
- Click **Access Demo Workspace** to explore the application without logging in.

Option 2:
Use the demo credentials below.

Email::-
admin@revenuehub.com
Password:
admin123

## ✨ Features

- 🤖 AI-Powered Financial Health Reports
- 📈 Revenue & Expense Analytics
- 💰 Cash Flow Forecasting
- ⚠️ Risk Detection & Anomaly Identification
- 🧠 AI Financial Advisor Chatbot
- 📊 Interactive Dashboards & Visualizations
- 📂 CSV Transaction Upload & Processing
- 🔥 Firebase Database Integration
- 📉 Business Health Score
- 💡 AI-Based Profitability Recommendations

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- React Markdown
- Lucide React

### Backend
- FastAPI
- Python
- Google Gemini AI API

### Database
- Firebase Firestore

### AI
- Google Gemini AI

---

## 🏗 System Architecture

```text
                CSV Upload
                     │
                     ▼
              React Frontend
                     │
          Firebase Firestore
                     │
                     ▼
             FastAPI Backend
                     │
             Google Gemini AI
                     │
                     ▼
      Financial Report & Insights
```

---

## 📌 Project Workflow

1. Upload business transaction data using CSV.
2. Store transactions securely in Firebase.
3. Generate KPIs and financial summaries.
4. Send transaction data to FastAPI backend.
5. Google Gemini AI analyzes the financial data.
6. Generate:
   - Financial Health Report
   - Business Health Score
   - Revenue Analysis
   - Expense Analysis
   - Cash Flow Forecast
   - Risk Detection
   - Actionable Recommendations
7. Display insights in an interactive dashboard.
8. Allow users to ask financial questions through the AI chatbot.

---

## 📷 Screenshots

### Dashboard
> Add dashboard screenshot here

### AI Insights
> Add AI insights screenshot here

### Financial Advisor Chat
> Add chatbot screenshot here

### Revenue Analytics
> Add analytics screenshot here

### CSV Upload
> Add upload screen screenshot here

---

## 📁 Project Structure

```
Revenue-Intelligence-Hub
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│
├── backend
│   ├── main.py
│   ├── ai_service.py
│   ├── models.py
│   ├── requirements.txt
│
├── README.md
└── .gitignore
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/sathwik-naga/Revenue-Intelligence-Hub.git
cd Revenue-Intelligence-Hub
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

## Environment Variables

Create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

**Never commit your `.env` file to GitHub.**

---

## Future Enhancements

- PDF Financial Report Export
- Excel Report Export
- Voice-Based AI Financial Assistant
- Multi-Company Support
- Advanced Forecasting Models
- Real-Time Financial Alerts
- Role-Based Authentication
- Mobile Responsive Dashboard

---

## 👨‍💻 Author

**Sathwik**

GitHub: https://github.com/sathwik-naga

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ If you found this project useful, consider giving it a Star on GitHub!

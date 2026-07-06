from fastapi.middleware.cors import CORSMiddleware
from models import AnalyzeRequest, ChatRequest
from ai_service import analyze_financials, ask_ai

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Revenue Intelligence Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://revenue-intelligence-hub-7we8.vercel.app",  # replace with your actual Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Revenue Intelligence Hub Backend Running"
    }


@app.post("/api/ai/analyze")
def analyze(request: AnalyzeRequest):
    result = analyze_financials(
        request.transactions,
        request.summary
    )
    return result


@app.post("/api/ai/chat")
def chat(request: ChatRequest):
    answer = ask_ai(
        request.question,
        request.transactions,
        request.summary
    )

    return {
        "answer": answer
    }
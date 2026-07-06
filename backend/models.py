from pydantic import BaseModel
from typing import List, Dict, Any


class AnalyzeRequest(BaseModel):
    transactions: List[Dict[str, Any]]
    summary: Dict[str, Any]


class ChatRequest(BaseModel):
    question: str
    transactions: List[Dict[str, Any]]
    summary: Dict[str, Any]
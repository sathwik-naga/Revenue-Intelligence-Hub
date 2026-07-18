from pydantic import BaseModel, Field
from typing import Optional

class ChatRequest(BaseModel):
    question: str
    company_id: Optional[str] = Field(None, alias="companyId")

    class Config:
        populate_by_name = True

class ChatResponse(BaseModel):
    answer: str
    timestamp: str
    question: str
    company_id: Optional[str] = Field(None, alias="companyId")

    class Config:
        populate_by_name = True

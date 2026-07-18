from pydantic import BaseModel, Field
from typing import Optional, Literal

class TransactionBase(BaseModel):
    date: str
    amount: float
    category: str
    description: str
    merchant: str
    payment_method: Optional[str] = Field(None, alias="paymentMethod")
    status: Literal["completed", "pending", "failed"] = "completed"
    notes: Optional[str] = None
    type: Literal["inflow", "outflow", "transfer", "refund"]
    payment_risk: Optional[Literal["low", "medium", "high"]] = Field("low", alias="paymentRisk")

    class Config:
        populate_by_name = True

class TransactionCreate(TransactionBase):
    company_id: Optional[str] = Field(None, alias="companyId")

class TransactionUpdate(BaseModel):
    date: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    merchant: Optional[str] = None
    payment_method: Optional[str] = Field(None, alias="paymentMethod")
    status: Optional[Literal["completed", "pending", "failed"]] = None
    notes: Optional[str] = None
    type: Optional[Literal["inflow", "outflow", "transfer", "refund"]] = None
    payment_risk: Optional[Literal["low", "medium", "high"]] = Field(None, alias="paymentRisk")
    company_id: Optional[str] = Field(None, alias="companyId")

    class Config:
        populate_by_name = True

class TransactionResponse(TransactionBase):
    id: str
    uid: str
    company_id: Optional[str] = Field(None, alias="companyId")

    class Config:
        populate_by_name = True
        from_attributes = True

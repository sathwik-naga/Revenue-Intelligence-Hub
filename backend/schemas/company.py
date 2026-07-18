from pydantic import BaseModel, Field
from typing import Optional

class CompanyBase(BaseModel):
    name: str = Field(..., alias="companyName")
    industry: str
    business_type: str = Field(..., alias="businessType")
    currency: str
    financial_year: str = Field(..., alias="financialYear")
    country: str

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "companyName": "Acme Corp Inc.",
                "industry": "Technology",
                "businessType": "SaaS",
                "currency": "USD",
                "financialYear": "2026",
                "country": "United States"
            }
        }

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, alias="companyName")
    industry: Optional[str] = None
    business_type: Optional[str] = Field(None, alias="businessType")
    currency: Optional[str] = None
    financial_year: Optional[str] = Field(None, alias="financialYear")
    country: Optional[str] = None

    class Config:
        populate_by_name = True

class CompanyResponse(CompanyBase):
    id: str
    uid: str

    class Config:
        populate_by_name = True
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "comp-1234",
                "uid": "user-5678",
                "companyName": "Acme Corp Inc.",
                "industry": "Technology",
                "businessType": "SaaS",
                "currency": "USD",
                "financialYear": "2026",
                "country": "United States"
            }
        }

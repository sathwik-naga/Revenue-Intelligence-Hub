from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RiskItem(BaseModel):
    risk: str
    severity: str
    financial_impact: str = Field(..., alias="financialImpact")
    recommendation: str

    class Config:
        populate_by_name = True

class OpportunityItem(BaseModel):
    opportunity: str
    estimated_financial_impact: str = Field(..., alias="estimatedFinancialImpact")
    difficulty: str
    expected_roi: str = Field(..., alias="expectedROI")

    class Config:
        populate_by_name = True

class RecommendationItem(BaseModel):
    priority: str
    action: str

class AnalysisStructure(BaseModel):
    summary: str
    business_health: str = Field(..., alias="businessHealth")
    risks: List[RiskItem] = []
    opportunities: List[OpportunityItem] = []
    recommendations: List[RecommendationItem] = []
    forecast: Dict[str, Any] = {}

    class Config:
        populate_by_name = True

class AnalysisResponse(BaseModel):
    id: str
    uid: str
    company_id: Optional[str] = Field(None, alias="companyId")
    analysis: AnalysisStructure
    timestamp: str
    confidence_score: float = Field(95.0, alias="confidenceScore")
    error: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

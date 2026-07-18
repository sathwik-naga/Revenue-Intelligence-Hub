from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from schemas.transaction import TransactionResponse

class DashboardOverview(BaseModel):
    total_revenue: float = Field(..., alias="totalRevenue")
    total_expenses: float = Field(..., alias="totalExpenses")
    net_profit: float = Field(..., alias="netProfit")
    profit_margin: float = Field(..., alias="profitMargin")
    runway_months: float = Field(..., alias="runwayMonths")
    top_expense_category: str = Field(..., alias="topExpenseCategory")
    top_customer: str = Field(..., alias="topCustomer")
    
    # Previous aggregates for growth indicators
    previous_revenue: float = Field(..., alias="previousRevenue")
    previous_expenses: float = Field(..., alias="previousExpenses")
    previous_profit: float = Field(..., alias="previousProfit")

    class Config:
        populate_by_name = True

class CashFlowPoint(BaseModel):
    name: str
    inflow: float = Field(..., alias="Inflow")
    outflow: float = Field(..., alias="Outflow")
    net: float = Field(..., alias="Net")

    class Config:
        populate_by_name = True

class ForecastPoint(BaseModel):
    name: str
    actual: Optional[float] = Field(None, alias="Actual")
    forecast: float = Field(..., alias="Forecast")

    class Config:
        populate_by_name = True

class ExpenseCategoryPiePoint(BaseModel):
    name: str
    value: float

class DashboardCharts(BaseModel):
    cash_flow: List[CashFlowPoint] = Field(..., alias="cashFlow")
    forecast: List[ForecastPoint] = Field(..., alias="forecast")
    expense_categories: List[ExpenseCategoryPiePoint] = Field(..., alias="expenseCategories")

    class Config:
        populate_by_name = True

class DashboardHealth(BaseModel):
    health_score: int = Field(..., alias="healthScore")
    health_label: str = Field(..., alias="healthLabel")
    factors: List[str] = []

    class Config:
        populate_by_name = True

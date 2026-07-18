from fastapi import APIRouter, Depends
from typing import List, Optional, Dict, Any
from utils.security import get_current_user
from services.dashboard_service import dashboard_service
from services.transaction_service import transaction_service
from repositories.analysis_repository import analysis_repository
from repositories.notification_repository import notification_repository
from schemas.dashboard import DashboardOverview, DashboardCharts, DashboardHealth
from schemas.transaction import TransactionResponse
from schemas.common import StandardResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=StandardResponse[Dict[str, Any]])
def get_consolidated_dashboard(company_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Consolidated endpoint that fetches all dashboard KPIs, charts, health, recent transactions, AI CFO analyses, and notifications."""
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    
    overview = dashboard_service.get_overview(uid, company_id)
    charts = dashboard_service.get_charts(uid, company_id)
    health = dashboard_service.get_health(uid, company_id)
    
    # Recent ledger items
    txs = transaction_service.list_transactions(uid, company_id)
    sorted_txs = sorted(txs, key=lambda x: x.get("date", ""), reverse=True)
    recent = sorted_txs[:5]
    
    # Latest analysis
    analysis = analysis_repository.get_latest_analysis(uid, company_id)
    
    # Notifications history
    notifs = notification_repository.list_notifications(uid)
    recent_notifs = notifs[:5]
    
    data = {
        "overview": overview,
        "charts": charts,
        "health": health,
        "recentTransactions": recent,
        "latestAnalysis": analysis,
        "notifications": recent_notifs
    }
    
    return StandardResponse(
        success=True,
        message="Consolidated dashboard data loaded.",
        data=data
    )

@router.get("/overview", response_model=StandardResponse[DashboardOverview])
def get_overview(company_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    overview = dashboard_service.get_overview(uid, company_id)
    return StandardResponse(
        success=True,
        message="Dashboard overview loaded.",
        data=overview
    )

@router.get("/charts", response_model=StandardResponse[DashboardCharts])
def get_charts(company_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    charts = dashboard_service.get_charts(uid, company_id)
    return StandardResponse(
        success=True,
        message="Dashboard charts compiled.",
        data=charts
    )

@router.get("/health", response_model=StandardResponse[DashboardHealth])
def get_health(company_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    health = dashboard_service.get_health(uid, company_id)
    return StandardResponse(
        success=True,
        message="Business health audit completed.",
        data=health
    )

@router.get("/recent-transactions", response_model=StandardResponse[List[TransactionResponse]])
def get_recent_transactions(company_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    txs = transaction_service.list_transactions(uid, company_id)
    
    sorted_txs = sorted(txs, key=lambda x: x.get("date", ""), reverse=True)
    recent = sorted_txs[:5]
    
    return StandardResponse(
        success=True,
        message="Recent ledger items loaded.",
        data=recent
    )

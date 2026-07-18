from fastapi import APIRouter, Depends, Query, Response, status
from typing import Optional
from datetime import datetime

from utils.security import get_current_user
from services.report_service import report_service
from repositories.audit_repository import audit_repository

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export/csv")
def export_csv(
    company_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    
    csv_data = report_service.generate_csv_report(uid, company_id)
    
    # Log audit event
    audit_repository.log_action(
        uid=uid,
        action="Report exported",
        details=f"Exported CSV ledger report for company {company_id or 'default'}"
    )
    
    filename = f"ledger_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache"
        }
    )

@router.get("/export/excel")
def export_excel(
    company_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    
    excel_bytes = report_service.generate_excel_report(uid, company_id)
    
    # Log audit event
    audit_repository.log_action(
        uid=uid,
        action="Report exported",
        details=f"Exported Excel KPI spreadsheet for company {company_id or 'default'}"
    )
    
    filename = f"executive_spreadsheet_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache"
        }
    )

@router.get("/export/pdf")
def export_pdf(
    company_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    
    pdf_bytes = report_service.generate_pdf_report(uid, company_id)
    
    # Log audit event
    audit_repository.log_action(
        uid=uid,
        action="Report exported",
        details=f"Exported PDF Executive Advisory report for company {company_id or 'default'}"
    )
    
    filename = f"advisory_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache"
        }
    )

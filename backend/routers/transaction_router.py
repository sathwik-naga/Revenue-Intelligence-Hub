from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Request
from typing import List, Optional
from utils.security import get_current_user
from services.transaction_service import transaction_service
from services.ai_service import ai_service
from schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from schemas.common import StandardResponse
from utils.logging import logger

router = APIRouter(tags=["Transactions"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

def process_upload_pipeline(uid: str, company_id: Optional[str], file_bytes: bytes, filename: str, ip: str, correlation_id: str):
    """Processes ledger files, updates pipeline status, triggers AI analysis and logs audit trails in background."""
    try:
        from services.notification_service import notification_service
        # Update pipeline status to Sending (Processing)
        notification_service.update_pipeline_status(uid, "Sending")
        
        # 1. Parse and write transactions atomically
        transaction_service.parse_and_import_file(uid, company_id, file_bytes, filename)
        
        # 2. Run Financial AI Analysis & send notifications (notifications triggered inside run_financial_analysis)
        ai_service.run_financial_analysis(uid, company_id)
        
        # 3. Log audit event
        from repositories.audit_repository import audit_repository
        audit_repository.log_action(
            uid=uid,
            action="CSV upload",
            details=f"Uploaded and processed ledger file: {filename} for company {company_id or 'default'}",
            ip=ip,
            correlation_id=correlation_id
        )
    except Exception as e:
        logger.error(f"Error in background file processing pipeline for user {uid}: {str(e)}")
        from services.notification_service import notification_service
        notification_service.update_pipeline_status(uid, "Failed")

@router.post("/transactions", response_model=StandardResponse[TransactionResponse])
def create_transaction(schema: TransactionCreate, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    tx = transaction_service.create_transaction(uid, schema)
    return StandardResponse(
        success=True,
        message="Transaction recorded successfully.",
        data=tx
    )

@router.get("/transactions", response_model=StandardResponse[List[TransactionResponse]])
def list_transactions(company_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    txs = transaction_service.list_transactions(uid, company_id)
    return StandardResponse(
        success=True,
        message="Transactions loaded successfully.",
        data=txs
    )

@router.get("/transactions/{tx_id}", response_model=StandardResponse[TransactionResponse])
def get_transaction(tx_id: str, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    tx = transaction_service.get_transaction(tx_id)
    if not tx or tx.get("uid") != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found."
        )
    return StandardResponse(
        success=True,
        message="Transaction details loaded.",
        data=tx
    )

@router.put("/transactions/{tx_id}", response_model=StandardResponse[TransactionResponse])
def update_transaction(tx_id: str, schema: TransactionUpdate, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    tx = transaction_service.get_transaction(tx_id)
    if not tx or tx.get("uid") != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found."
        )
    updated = transaction_service.update_transaction(tx_id, schema)
    return StandardResponse(
        success=True,
        message="Transaction updated successfully.",
        data=updated
    )

@router.delete("/transactions/{tx_id}", response_model=StandardResponse[dict])
def delete_transaction(tx_id: str, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    tx = transaction_service.get_transaction(tx_id)
    if not tx or tx.get("uid") != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found."
        )
    transaction_service.delete_transaction(tx_id)
    return StandardResponse(
        success=True,
        message="Transaction deleted successfully.",
        data={"id": tx_id}
    )

@router.post("/upload/csv", status_code=status.HTTP_202_ACCEPTED, response_model=StandardResponse[dict])
async def upload_csv(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    company_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    # Validate file format and extensions
    filename = file.filename.lower()
    if not (filename.endswith(".csv") or filename.endswith(".xlsx") or filename.endswith(".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a CSV or Excel sheet (.xlsx, .xls)."
        )
        
    if company_id in ["null", "undefined", ""]:
        company_id = None
    uid = current_user["uid"]
    
    # Check file size limit before backgrounding
    try:
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Uploaded file exceeds limit. Maximum file size is {MAX_FILE_SIZE / (1024*1024):.0f}MB."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading file headers or contents: {str(e)}"
        )
        
    # Queue full extraction & analytics parsing flow in background
    background_tasks.add_task(
        process_upload_pipeline,
        uid,
        company_id,
        file_bytes,
        file.filename,
        request.client.host if request.client else "0.0.0.0",
        getattr(request.state, "correlation_id", "N/A")
    )
    
    return StandardResponse(
        success=True,
        message="Statement upload accepted. Extracting transactions and generating AI insights in the background.",
        data={
            "status": "processing",
            "companyId": company_id
        }
    )

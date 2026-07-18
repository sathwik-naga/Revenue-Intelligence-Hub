from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

from utils.security import get_current_user
from repositories.notification_repository import notification_repository
from services.notification_service import notification_service
from schemas.common import StandardResponse
from utils.logging import logger

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# Schema Definitions
class SendNotificationRequest(BaseModel):
    companyId: Optional[str] = None

class TestEmailRequest(BaseModel):
    email: Optional[str] = None

class TestWhatsAppRequest(BaseModel):
    phoneNumber: str

class PreferencesUpdate(BaseModel):
    emailEnabled: Optional[bool] = None
    whatsappEnabled: Optional[bool] = None
    weeklySummary: Optional[bool] = None
    aiAlerts: Optional[bool] = None
    expenseAlerts: Optional[bool] = None
    profitAlerts: Optional[bool] = None
    csvCompleted: Optional[bool] = None
    whatsappNumber: Optional[str] = None

# Existing Endpoints (Preserved for compatibility)
@router.get("", response_model=StandardResponse[List[dict]])
def list_notifications(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    notifs = notification_repository.list_notifications(uid)
    return StandardResponse(
        success=True,
        message="Notifications retrieved.",
        data=notifs
    )

@router.post("/read", response_model=StandardResponse[dict])
def mark_read(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    notification_repository.mark_all_read(uid)
    return StandardResponse(
        success=True,
        message="Notifications marked as read.",
        data={}
    )

# New Notification Center Endpoints
@router.post("/send", response_model=StandardResponse[dict])
def trigger_send(body: SendNotificationRequest, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    company_id = body.companyId
    
    try:
        notification_service.update_pipeline_status(uid, "Sending")
        success = notification_service.send_report_notification(uid, company_id)
        if not success:
            raise Exception("Notification workflow was not fully executed.")
        return StandardResponse(
            success=True,
            message="Executive notification report run completed.",
            data={}
        )
    except Exception as e:
        logger.error(f"Error in manual trigger send for user {uid}: {str(e)}", exc_info=True)
        notification_service.update_pipeline_status(uid, "Failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run notification service workflow."
        )

@router.post("/email/test", response_model=StandardResponse[dict])
def test_email(body: TestEmailRequest, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    to_email = body.email or current_user.get("email")
    
    if not to_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No recipient email address could be resolved."
        )
        
    try:
        # Build simple test template
        subject = "📊 Test Email - Revenue Hub"
        html_content = f"""
        <html>
        <body style="background-color: #020617; color: #f8fafc; font-family: sans-serif; padding: 20px;">
          <h2 style="color: #06b6d4;">Revenue Hub</h2>
          <p>This is a test notification confirming your email parameters are configured correctly.</p>
          <hr style="border-color: #1e293b;"/>
          <p style="font-size: 11px; color: #64748b;">Generated automatically by Revenue Hub AI</p>
        </body>
        </html>
        """
        notification_service.send_email(to_email, subject, html_content)
        return StandardResponse(
            success=True,
            message="Test email sent successfully.",
            data={}
        )
    except Exception as e:
        logger.error(f"Test email send failed for user {uid} to {to_email}: {str(e)}", exc_info=True)
        # Never expose SMTP errors to the user
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email delivery failed. Please try again later."
        )

@router.post("/whatsapp/test", response_model=StandardResponse[dict])
def test_whatsapp(body: TestWhatsAppRequest, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    to_number = body.phoneNumber
    
    try:
        msg = "📊 *Revenue Hub*\n\nThis is a test message confirming your Twilio WhatsApp parameters are configured correctly."
        success = notification_service.send_whatsapp(to_number, msg)
        if not success:
            raise Exception("Twilio send returned false (missing credentials).")
        return StandardResponse(
            success=True,
            message="Test WhatsApp summary sent successfully.",
            data={}
        )
    except Exception as e:
        logger.error(f"Test WhatsApp send failed for user {uid} to {to_number}: {str(e)}", exc_info=True)
        # Never expose Twilio errors to the user
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WhatsApp delivery failed. Please try again later."
        )

@router.get("/history", response_model=StandardResponse[List[dict]])
def get_history(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    history = notification_service.list_history(uid)
    return StandardResponse(
        success=True,
        message="Notification logs retrieved.",
        data=history
    )

@router.get("/preferences", response_model=StandardResponse[dict])
def get_preferences(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    prefs = notification_service.get_user_preferences(uid)
    return StandardResponse(
        success=True,
        message="Notification preferences loaded.",
        data=prefs
    )

@router.put("/preferences", response_model=StandardResponse[dict])
def update_preferences(body: PreferencesUpdate, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    # Get existing preferences first
    existing = notification_service.get_user_preferences(uid)
    
    # Update fields provided in the body
    updates = body.dict(exclude_unset=True)
    for k, v in updates.items():
        existing[k] = v
        
    notification_service.save_user_preferences(uid, existing)
    return StandardResponse(
        success=True,
        message="Notification settings synchronized.",
        data=existing
    )

@router.get("/status", response_model=StandardResponse[dict])
def get_status(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    pipe_status = notification_service.get_pipeline_status(uid)
    return StandardResponse(
        success=True,
        message="Pipeline status loaded.",
        data={"status": pipe_status}
    )

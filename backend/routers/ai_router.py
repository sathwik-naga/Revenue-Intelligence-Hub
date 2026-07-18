from utils.logging import logger
from fastapi import APIRouter, Depends
from typing import Optional
from utils.security import get_current_user
from services.ai_service import ai_service
from repositories.analysis_repository import analysis_repository
from schemas.chat import ChatRequest, ChatResponse
from schemas.analysis import AnalysisResponse
from schemas.common import StandardResponse

router = APIRouter(prefix="/ai", tags=["AI CFO Co-Pilot"])

@router.post("/analyze", response_model=StandardResponse[AnalysisResponse])
def run_analysis(company_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    analysis = ai_service.run_financial_analysis(uid, company_id)
    return StandardResponse(
        success=True,
        message="AI Financial analysis complete.",
        data=analysis
    )

@router.get("/analysis/latest", response_model=StandardResponse[Optional[AnalysisResponse]])
def get_latest_analysis(company_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    analysis = analysis_repository.get_latest_analysis(uid, company_id)

    if analysis is None:
        logger.info(f"No usable cached analysis found for user {uid}; returning null")
    else:
        logger.info(f"Returning cached analysis for user {uid}")

    # Log live request response details
    print("\nGET /api/ai/analysis/latest Response", flush=True)
    print("-------------------------------------", flush=True)
    import json
    if analysis:
        try:
            print(json.dumps(analysis.get("analysis", analysis), indent=2), flush=True)
        except Exception:
            print(str(analysis), flush=True)
    else:
        print("None", flush=True)
    print("", flush=True)

    return StandardResponse(
        success=True,
        message="Latest analysis retrieved successfully.",
        data=analysis
    )

@router.post("/chat", response_model=StandardResponse[ChatResponse])
def chat_with_cfo(schema: ChatRequest, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    company_id = schema.company_id
    question = schema.question
    
    answer = ai_service.ask_ai_question(uid, company_id, question)
    
    from datetime import datetime
    response_data = {
        "answer": answer,
        "timestamp": datetime.utcnow().strftime("%I:%M %p"),
        "question": question,
        "companyId": company_id
    }
    
    return StandardResponse(
        success=True,
        message="AI response retrieved.",
        data=response_data
    )

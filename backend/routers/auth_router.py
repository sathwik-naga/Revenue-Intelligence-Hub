from fastapi import APIRouter, Depends
from utils.security import get_current_user
from schemas.common import StandardResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/session", response_model=StandardResponse[dict])
def get_session(current_user: dict = Depends(get_current_user)):
    user_profile = {
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
        "name": current_user.get("name") or current_user.get("email", "").split("@")[0],
        "avatar": current_user.get("picture")
    }
    return StandardResponse(
        success=True,
        message="User session synchronized.",
        data=user_profile
    )

from fastapi import Security, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from config.config import settings
from utils.logging import logger

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
    # Bypass verification in mock mode
    if settings.DEVELOPMENT_MOCK:
        return {
            "uid": "mock-user-uid",
            "email": "admin@revenuehub.com",
            "name": "Admin User",
            "picture": None
        }

    try:
        # Verify the Firebase ID token explicitly
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token  # Contains uid, email, name, picture
    except firebase_auth.ExpiredIdTokenError:
        logger.warning("Token verification failed: Token expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer error=\"token_expired\""},
        )
    except firebase_auth.InvalidIdTokenError:
        logger.warning("Token verification failed: Invalid token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\""},
        )
    except Exception as e:
        logger.error(f"Authentication verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Invalid or expired token signature.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_user_role(uid: str) -> str:
    """Queries Firestore user profile to resolve authorization role."""
    if settings.DEVELOPMENT_MOCK:
        return "admin"
    try:
        from utils.firebase import get_firestore
        doc = get_firestore().collection("users").document(uid).get()
        if doc.exists:
            return doc.to_dict().get("role", "user")
    except Exception as e:
        logger.error(f"Error fetching role for user {uid}: {str(e)}")
    return "user"

def require_role(required_role: str):
    """FastAPI dependency gate checking user privilege level."""
    def dependency(current_user: dict = Depends(get_current_user)):
        uid = current_user["uid"]
        role = get_user_role(uid)
        if role != required_role and role != "admin": # Admins bypass all role checks
            logger.warning(f"Privilege check failed: User {uid} of role '{role}' requested '{required_role}' access.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Insufficient workspace permissions."
            )
        return current_user
    return dependency

admin_required = require_role("admin")

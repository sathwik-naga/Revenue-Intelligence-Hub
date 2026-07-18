import os
import sys
from dotenv import load_dotenv

# Resolve the backend root directory and load backend/.env explicitly
backend_root = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_root, ".env")

load_dotenv(dotenv_path=env_path)

from fastapi import Depends, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.responses import JSONResponse
import firebase_admin

from config.config import settings
from utils.firebase import initialize_firebase, db
from utils.security import get_current_user
from utils.logging import LoggingMiddleware, logger
from middleware.security_middleware import SecurityHeadersMiddleware
from middleware.rate_limit_middleware import RateLimitMiddleware
from services.metrics_service import metrics_service

from routers import (
    auth_router,
    company_router,
    transaction_router,
    dashboard_router,
    ai_router,
    notification_router,
    report_router
)

# Startup Environment Validation Gate
def validate_environment():
    """Validate required environment variables."""

    if settings.DEVELOPMENT_MOCK:
        logger.info("DEVELOPMENT_MOCK=True enabled. Skipping credential validation.")
        return

    missing = []

    # Gemini is always required
    if not settings.GEMINI_API_KEY:
        missing.append("GEMINI_API_KEY")

    # Firebase validation
    #
    # Accept EITHER:
    # 1. GOOGLE_APPLICATION_CREDENTIALS
    # OR
    # 2. FIREBASE_PROJECT_ID + CLIENT_EMAIL + PRIVATE_KEY
    #

    using_service_account = bool(settings.GOOGLE_APPLICATION_CREDENTIALS)

    using_env_credentials = (
        bool(settings.FIREBASE_PROJECT_ID)
        and bool(settings.FIREBASE_CLIENT_EMAIL)
        and bool(settings.FIREBASE_PRIVATE_KEY)
    )

    if not using_service_account and not using_env_credentials:
        missing.append(
            "GOOGLE_APPLICATION_CREDENTIALS (or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)"
        )

    if missing:
        logger.critical(
            "Missing required environment variables: %s",
            ", ".join(missing),
        )
        raise RuntimeError(
            "Missing required environment variables: "
            + ", ".join(missing)
        )

    if not settings.RESEND_API_KEY and not settings.SMTP_USERNAME:
        logger.warning(
            "Email provider not configured. Email notifications will be skipped."
        )

    if not settings.TWILIO_ACCOUNT_SID:
        logger.warning(
            "Twilio not configured. WhatsApp notifications will be skipped."
        )
# Execute startup check
validate_environment()

# Initialize FastAPI application
app = FastAPI(
    title="Revenue Hub API",
    description="Enterprise API Core for Revenue Hub.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = [x.strip() for x in settings.CORS_ORIGINS.split(",") if x.strip()]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom middleware (Security -> Rate Limiter -> Request Logging)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# Centralized Standard Exception Formatters
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    correlation_id = getattr(request.state, "correlation_id", "N/A")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "errorCode": f"HTTP_{exc.status_code}",
            "data": None,
            "correlationId": correlation_id
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    correlation_id = getattr(request.state, "correlation_id", "N/A")
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(x) for x in err.get("loc", []))
        errors.append({
            "field": loc,
            "message": err.get("msg", "Invalid parameter value"),
            "type": err.get("type", "value_error")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Request parameter validation failed.",
            "errorCode": "VALIDATION_ERROR",
            "data": errors,
            "correlationId": correlation_id
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "N/A")
    logger.error(f"[{correlation_id}] Unhandled runtime error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred. Please try again later.",
            "errorCode": "INTERNAL_SERVER_ERROR",
            "data": None,
            "correlationId": correlation_id
        }
    )

# Include Router endpoints under legacy prefix (/api) for compatibility
app.include_router(auth_router.router, prefix="/api")
app.include_router(company_router.router, prefix="/api")
app.include_router(transaction_router.router, prefix="/api")
app.include_router(dashboard_router.router, prefix="/api")
app.include_router(ai_router.router, prefix="/api")
app.include_router(notification_router.router, prefix="/api")
app.include_router(report_router.router, prefix="/api")

# Include Router endpoints under standard versioned prefix (/api/v1)
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(company_router.router, prefix="/api/v1")
app.include_router(transaction_router.router, prefix="/api/v1")
app.include_router(dashboard_router.router, prefix="/api/v1")
app.include_router(ai_router.router, prefix="/api/v1")
app.include_router(notification_router.router, prefix="/api/v1")
app.include_router(report_router.router, prefix="/api/v1")

def print_startup_banner():
    """Prints a beautiful enterprise startup verification status banner on boot."""
    is_firebase = (firebase_admin._apps or settings.DEVELOPMENT_MOCK)
    is_firestore = (db is not None or settings.DEVELOPMENT_MOCK)
    is_gemini = bool(settings.GEMINI_API_KEY)
    is_notif = bool(settings.RESEND_API_KEY or settings.SMTP_USERNAME)

    print("\n==========================================", flush=True)
    print("Revenue Hub Backend", flush=True)
    print("------------------------------------------", flush=True)
    print(f"✓ FastAPI Running (CORS: {settings.CORS_ORIGINS})", flush=True)
    print(f"{'✓' if is_firebase else '✗'} Firebase Connected", flush=True)
    print(f"{'✓' if is_firestore else '✗'} Firestore Connected", flush=True)
    print(f"{'✓' if is_gemini else '✗'} Gemini Ready", flush=True)
    print(f"{'✓' if is_notif else '✗'} Notification Service Ready", flush=True)
    print("✓ Reports Ready", flush=True)
    print("------------------------------------------", flush=True)
    print("Version 1.0.0", flush=True)
    print("==========================================\n", flush=True)

# Initialize Firebase and print status banner on boot
@app.on_event("startup")
async def startup_event():
    initialize_firebase()
    print_startup_banner()
    logger.info("FastAPI backend engine started successfully.")

# Custom Health Check Endpoints
@app.get("/health")
@app.get("/api/health")
@app.get("/api/v1/health")
def health_check():
    """Custom Health Check returning precise service statuses."""
    is_firebase = "connected" if (firebase_admin._apps or settings.DEVELOPMENT_MOCK) else "disconnected"
    is_firestore = "connected" if (db is not None or settings.DEVELOPMENT_MOCK) else "disconnected"
    is_gemini = "available" if settings.GEMINI_API_KEY else "unavailable"
    is_notif = "ready" if (settings.RESEND_API_KEY or settings.SMTP_USERNAME) else "disabled"
    
    return {
        "status": "healthy",
        "database": is_firestore,
        "firebase": is_firebase,
        "gemini": is_gemini,
        "notifications": is_notif,
        "version": "1.0.0"
    }

# Performance Metrics Endpoints
@app.get("/api/system/metrics")
@app.get("/api/v1/system/metrics")
def get_system_metrics(current_user: dict = Depends(get_current_user)):
    """Exposes real-time average processing latencies for core services."""
    return {
        "success": True,
        "message": "Performance metrics fetched successfully.",
        "data": metrics_service.get_stats()
    }

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Revenue Hub Backend Running",
        "data": {
            "version": "1.0.0",
            "docs": "/docs"
        }
    }
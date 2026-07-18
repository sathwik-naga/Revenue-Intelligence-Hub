import logging
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from services.metrics_service import metrics_service

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("RevenueIntelligenceHub")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Resolve Correlation ID
        correlation_id = getattr(request.state, "correlation_id", "N/A")
        
        # Determine client identity
        auth_header = request.headers.get("Authorization")
        user_info = "Anonymous"
        if auth_header and auth_header.startswith("Bearer "):
            user_info = "Authenticated Client"
            
        logger.info(
            f"[{correlation_id}] Incoming request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'} ({user_info})"
        )
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            # Record response time performance metric
            metrics_service.record("api_response_time", process_time)
            
            logger.info(
                f"[{correlation_id}] Completed request: {request.method} {request.url.path} "
                f"- Status: {response.status_code} - Duration: {process_time*1000:.2f}ms"
            )
            return response
        except Exception as e:
            process_time = time.time() - start_time
            # Record response time for failed request
            metrics_service.record("api_response_time", process_time)
            
            logger.error(
                f"[{correlation_id}] Failed request: {request.method} {request.url.path} "
                f"- Error: {str(e)} - Duration: {process_time*1000:.2f}ms"
            )
            raise e

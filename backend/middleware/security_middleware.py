import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Assign a unique Correlation ID for traceability
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id
        
        response = await call_next(request)
        
        # Inject correlation ID and standard enterprise security headers
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "img-src 'self' data: https://lh3.googleusercontent.com; "
            "frame-ancestors 'none';"
        )
        # Enable HSTS for HTTPS transport security
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

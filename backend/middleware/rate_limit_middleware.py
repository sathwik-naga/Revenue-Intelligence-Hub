import time
from collections import defaultdict
from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from config.config import settings

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Store request timestamps per identifier (client IP or token hash)
        self.requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        # Bypass rate limiting for docs, static schemas and health queries
        if path.startswith("/docs") or path.startswith("/redoc") or path == "/openapi.json" or path == "/health" or path.endswith("/health"):
            return await call_next(request)

        # Determine rate limit key & threshold
        client_id = request.client.host if request.client else "unknown"
        auth_header = request.headers.get("Authorization")
        limit = settings.RATE_LIMIT_PUBLIC

        if auth_header and auth_header.startswith("Bearer "):
            # Extract token hash to identify authenticated user cleanly
            token = auth_header.split(" ")[1]
            client_id = hash(token)
            limit = settings.RATE_LIMIT_AUTHENTICATED

        now = time.time()
        # Filter request logs within sliding 60-second window
        cutoff = now - 60.0
        timestamps = self.requests[client_id]
        self.requests[client_id] = [t for t in timestamps if t > cutoff]

        if len(self.requests[client_id]) >= limit:
            correlation_id = getattr(request.state, "correlation_id", "N/A")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "message": "Rate limit exceeded. Please try again later.",
                    "errorCode": "RATE_LIMIT_EXCEEDED",
                    "data": None,
                    "correlationId": correlation_id
                }
            )

        self.requests[client_id].append(now)
        return await call_next(request)

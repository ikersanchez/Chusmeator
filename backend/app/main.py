"""Main FastAPI application."""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging
import os
from app.config import settings, validate_production_settings
from app.database import init_db
from app.routers import pins, areas, general, votes, comments, admin, user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Validate production secrets before app starts
validate_production_settings()

# Conditionally disable API docs in production (#4)
docs_kwargs = {}
if not settings.debug:
    docs_kwargs = {"docs_url": None, "redoc_url": None, "openapi_url": None}

# Create FastAPI app
app = FastAPI(
    title="Chusmeator API",
    description="Backend API for Chusmeator interactive map application",
    version="1.0.0",
    **docs_kwargs,
)


# Security headers middleware (#10)
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=()"
        if settings.https_only:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# Add Session Middleware (#2 — https_only from config)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.secret_key,
    session_cookie=settings.session_cookie_name,
    max_age=3600 * 24 * 7,  # 1 week
    same_site="lax",
    https_only=settings.https_only,
)

# Configure CORS - restrict to known origins
origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Key"], # Only allow necessary headers
)

# Include routers
app.include_router(general.router)
app.include_router(pins.router)
app.include_router(areas.router)

app.include_router(votes.router)
app.include_router(comments.router)
app.include_router(admin.router)
app.include_router(user.router)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    init_db()



@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/{catchall:path}")
async def serve_frontend(catchall: str):
    """Catch-all route to serve static files or index.html for SPA."""
    if catchall == "" or catchall == "index.html":
        return FileResponse(os.path.join(static_dir, "index.html"))
    
    # Path traversal protection (#8): resolve and validate path stays within static_dir
    resolved_static = os.path.realpath(static_dir)
    file_path = os.path.realpath(os.path.join(static_dir, catchall))
    
    if not file_path.startswith(resolved_static + os.sep) and file_path != resolved_static:
        # Attempted path traversal — serve index.html instead
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Chusmeator API", "status": "Not found"}
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Fallback to index.html for SPA routing
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    # If no static dir, return a simple JSON response
    return {
        "message": "Chusmeator API",
        "status": "Frontend not found",
    }

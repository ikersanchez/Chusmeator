"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import logging
from app.config import settings
from app.database import init_db
from app.routers import pins, areas, general, votes, comments, admin

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Chusmeator API",
    description="Backend API for Chusmeator interactive map application",
    version="1.0.0"
)

# Add Session Middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.secret_key,
    session_cookie=settings.session_cookie_name,
    max_age=3600 * 24 * 7,  # 1 week
    same_site="lax",
    https_only=False,  # Set to True in production with HTTPS
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

@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    init_db()


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Chusmeator API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

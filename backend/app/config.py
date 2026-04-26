import sys
import logging
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

# Values that must NOT be used in production
_INSECURE_DEFAULTS = {
    "dev-secret-key-change-me-12345",
    "change-this-secret-before-deploying",
    "replace-me-with-a-secure-key",
    "",
}


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Debug mode: enables Swagger docs, X-User-Id header, verbose errors
    debug: bool = False
    
    database_url: str = "sqlite:///./chusmeator.db"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    # LocationIQ API for address search
    locationiq_url: str = "https://us1.locationiq.com/v1/search"
    locationiq_api_key: str = ""
    # Secret key required in X-Admin-Key header to access /api/admin/* endpoints
    admin_key: str = ""
    # Secret key for session signing (change in production!)
    secret_key: str = "dev-secret-key-change-me-12345"
    session_cookie_name: str = "chusmeator_session"
    # Set to True when serving over HTTPS (production)
    https_only: bool = True
    deepseek_api_key: str = ""
    
    # Abuse prevention limits
    max_pins_per_day: int = 10
    max_areas_per_day: int = 10
    max_comments_per_day: int = 10
    max_area_size_deg: float = 0.02  # Approx 2.2km (adjusted to 0.02)
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


def validate_production_settings() -> None:
    """Validate that critical secrets are not using insecure defaults in production."""
    if settings.debug:
        logger.warning("⚠️  Running in DEBUG mode. Do NOT use in production.")
        return
    
    errors: list[str] = []
    
    if settings.secret_key in _INSECURE_DEFAULTS:
        errors.append(
            "SECRET_KEY is set to an insecure default. "
            "Generate a secure key: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
    
    if settings.admin_key in _INSECURE_DEFAULTS:
        errors.append(
            "ADMIN_KEY is set to an insecure default or is empty. "
            "Set a strong ADMIN_KEY environment variable."
        )
    
    if errors:
        for err in errors:
            logger.critical(f"🚨 SECURITY: {err}")
        sys.exit(1)


from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    database_url: str = "sqlite:///./chusmeator.db"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    nominatim_url: str = "https://nominatim.openstreetmap.org"
    # Secret key required in X-Admin-Key header to access /api/admin/* endpoints
    admin_key: str = ""
    # Secret key for session signing (change in production!)
    secret_key: str = "dev-secret-key-change-me-12345"
    session_cookie_name: str = "chusmeator_session"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    database_url: str = "sqlite:///./chusmeator.db"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    nominatim_url: str = "https://nominatim.openstreetmap.org"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

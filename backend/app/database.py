"""Database configuration and session management."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.models import Base
import logging

logger = logging.getLogger(__name__)

# Create engine
db_url = settings.database_url
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)

    # Lightweight migration: add 'color' column to pins if it was created before this feature.
    # Only runs on PostgreSQL (information_schema is not available in SQLite).
    if not settings.database_url.startswith("sqlite"):
        from sqlalchemy import text
        with engine.begin() as conn:
            try:
                check_sql = text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name='pins' AND column_name='color';"
                )
                result = conn.execute(check_sql).fetchone()
                if not result:
                    conn.execute(text("ALTER TABLE pins ADD COLUMN color VARCHAR(10) NOT NULL DEFAULT 'blue';"))
                    logger.info("Migration: Added 'color' column to 'pins' table.")
            except Exception as e:
                logger.warning(f"Migration warning (color column): {e}")


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

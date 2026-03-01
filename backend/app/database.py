"""Database configuration and session management."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.models import Base

# Create engine
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.database_url,
    connect_args=connect_args
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
    
    # Run a lightweight manual migration to add the new color column if it doesn't exist
    from sqlalchemy import text
    with engine.begin() as conn:
        try:
            # Postgres query to check if column exists
            check_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name='pins' AND column_name='color';")
            result = conn.execute(check_sql).fetchone()
            if not result:
                conn.execute(text("ALTER TABLE pins ADD COLUMN color VARCHAR(10) NOT NULL DEFAULT 'blue';"))
                print("Migration: Added 'color' column to 'pins' table.")
        except Exception as e:
            print(f"Migration error: {e}")


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from fastapi import Header, HTTPException, Depends, Request
from typing import Optional
from sqlalchemy.orm import Session
import uuid
from app.database import get_db
from app.models import User
from app.config import settings


def get_optional_user_id(request: Request) -> Optional[str]:
    """
    Attempt to extract user ID from header or session cookie without creating it.
    """
    user_id = None
    
    # Only accept X-User-Id header in debug mode
    if settings.debug:
        user_id = request.headers.get("X-User-Id")
    
    if not user_id:
        user_id = request.session.get("user_id")
        
    return user_id


def get_current_user_id(request: Request, user_id: Optional[str] = Depends(get_optional_user_id)) -> str:
    """
    Extract or generate user ID from header or session cookie.
    If not found, generates a new one and sets the session cookie.
    """
    if not user_id:
        # Generate a new unique ID if not present
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        request.session["user_id"] = user_id
        
    return user_id


def ensure_user_exists(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """
    Ensure user exists in database, create if not.
    
    Args:
        user_id: Current user ID
        db: Database session
        
    Returns:
        User ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Create user if doesn't exist
        user = User(id=user_id)
        db.add(user)
        db.commit()
    return user_id

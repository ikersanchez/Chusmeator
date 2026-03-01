"""API dependencies and utilities."""
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User


def get_current_user_id(x_user_id: str = Header(..., alias="X-User-Id")) -> str:
    """
    Extract and validate user ID from request header.
    
    Args:
        x_user_id: User ID from X-User-Id header
        
    Returns:
        Validated user ID string
        
    Raises:
        HTTPException: If user ID header is missing or invalid
    """
    if not x_user_id or not x_user_id.strip():
        raise HTTPException(status_code=400, detail="X-User-Id header is required")
    return x_user_id.strip()


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

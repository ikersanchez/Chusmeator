"""API router for comment endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import ValidationError
from app import schemas
from app.models import PinModel, CommentModel
from app.database import get_db
from app.dependencies import ensure_user_exists

router = APIRouter(prefix="/api", tags=["Comments"])


@router.get("/pins/{pin_id}/comments", response_model=list[schemas.Comment])
def get_pin_comments(
    pin_id: int,
    db: Session = Depends(get_db)
):
    """Get all comments for a specific pin."""
    # Verify pin exists
    pin = db.query(PinModel).filter(PinModel.id == pin_id).first()
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
        
    comments = db.query(CommentModel).filter(CommentModel.pin_id == pin_id).order_by(CommentModel.created_at.desc()).all()
    
    return [
        schemas.Comment(
            id=c.id,
            pinId=c.pin_id,
            userId=c.user_id,
            text=c.text,
            createdAt=c.created_at
        ) for c in comments
    ]


@router.post("/pins/{pin_id}/comments", response_model=schemas.Comment, status_code=201)
def create_pin_comment(
    pin_id: int,
    comment_data: schemas.CommentCreate,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Add a new comment to a pin."""
    # Verify pin exists
    pin = db.query(PinModel).filter(PinModel.id == pin_id).first()
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
        
    # Generate ID from timestamp
    comment_id = int(datetime.now().timestamp() * 1000)
    
    db_comment = CommentModel(
        id=comment_id,
        pin_id=pin_id,
        user_id=user_id,
        text=comment_data.text
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return schemas.Comment(
        id=db_comment.id,
        pinId=db_comment.pin_id,
        userId=db_comment.user_id,
        text=db_comment.text,
        createdAt=db_comment.created_at
    )

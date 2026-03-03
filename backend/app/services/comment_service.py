from datetime import datetime, timezone, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import CommentModel, PinModel
from app import schemas
from fastapi import HTTPException
from app.config import settings

class CommentService:
    @staticmethod
    def get_comments_by_pin(db: Session, pin_id: int) -> list[CommentModel]:
        # Verify pin exists
        pin = db.query(PinModel).filter(PinModel.id == pin_id).first()
        if not pin:
            raise HTTPException(status_code=404, detail="Pin not found")
            
        return db.query(CommentModel).filter(CommentModel.pin_id == pin_id).order_by(CommentModel.created_at.desc()).all()

    @staticmethod
    def create_comment(db: Session, pin_id: int, comment_data: schemas.CommentCreate, user_id: str) -> CommentModel:
        # Verify pin exists
        pin = db.query(PinModel).filter(PinModel.id == pin_id).first()
        if not pin:
            raise HTTPException(status_code=404, detail="Pin not found")
            
        # Rate limit check: max 20 comments per 24 hours (across all pins)
        one_day_ago = datetime.now(timezone.utc) - timedelta(days=1)
        comment_count = db.query(func.count(CommentModel.id)).filter(
            CommentModel.user_id == user_id,
            CommentModel.created_at >= one_day_ago
        ).scalar()
        
        if comment_count >= settings.max_comments_per_day:
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded: Maximum {settings.max_comments_per_day} comments per day allowed."
            )
            
        db_comment = CommentModel(
            pin_id=pin_id,
            user_id=user_id,
            text=comment_data.text
        )
        
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return db_comment

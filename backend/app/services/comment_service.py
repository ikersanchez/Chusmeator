from datetime import datetime, timezone, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import CommentModel, ModerationLogModel, PinModel, AreaModel
from app import schemas
from fastapi import HTTPException
from app.config import settings

class CommentService:
    @staticmethod
    def _validate_target(db: Session, target_type: str, target_id: int):
        """Validate that the target (pin or area) exists."""
        if target_type == "pin":
            target = db.query(PinModel).filter(PinModel.id == target_id).first()
            if not target:
                raise HTTPException(status_code=404, detail="Pin not found")
        elif target_type == "area":
            target = db.query(AreaModel).filter(AreaModel.id == target_id).first()
            if not target:
                raise HTTPException(status_code=404, detail="Area not found")
        else:
            raise HTTPException(status_code=400, detail="Invalid target_type")

    @staticmethod
    def get_comments(db: Session, target_type: str, target_id: int) -> list[CommentModel]:
        CommentService._validate_target(db, target_type, target_id)
        return db.query(CommentModel).filter(
            CommentModel.target_type == target_type,
            CommentModel.target_id == target_id
        ).order_by(CommentModel.created_at.desc()).all()

    @staticmethod
    def check_rate_limit(db: Session, user_id: str) -> None:
        """Check if the user has exceeded their daily limit for creating comments (including rejected attempts)."""
        one_day_ago = datetime.now(timezone.utc) - timedelta(days=1)
        # Count all moderation attempts for comments by this user in the last 24h
        attempt_count = db.query(func.count(ModerationLogModel.id)).filter(
            ModerationLogModel.user_id == user_id,
            ModerationLogModel.action == "comment",
            ModerationLogModel.created_at >= one_day_ago
        ).scalar()
        
        if attempt_count >= settings.max_comments_per_day:
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded: Maximum {settings.max_comments_per_day} attempts per day allowed."
            )

    @staticmethod
    def create_comment(db: Session, target_type: str, target_id: int, comment_data: schemas.CommentCreate, user_id: str) -> CommentModel:
        CommentService._validate_target(db, target_type, target_id)
        # Rate limit is now checked in the router before moderation
            
        db_comment = CommentModel(
            target_type=target_type,
            target_id=target_id,
            user_id=user_id,
            text=comment_data.text
        )
        
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return db_comment

    @staticmethod
    def get_comment_counts(db: Session, target_type: str) -> dict[int, int]:
        """Get comment counts grouped by target_id for a given target_type."""
        rows = (
            db.query(CommentModel.target_id, func.count(CommentModel.id))
            .filter(CommentModel.target_type == target_type)
            .group_by(CommentModel.target_id)
            .all()
        )
        return {target_id: int(total) for target_id, total in rows}

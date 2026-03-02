from sqlalchemy.orm import Session
from app.models import CommentModel, PinModel
from app import schemas
from fastapi import HTTPException

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
            
        db_comment = CommentModel(
            pin_id=pin_id,
            user_id=user_id,
            text=comment_data.text
        )
        
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return db_comment

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas
from app.database import get_db
from app.dependencies import ensure_user_exists
from app.services.comment_service import CommentService

router = APIRouter(prefix="/api", tags=["Comments"])


@router.get("/pins/{pin_id}/comments", response_model=list[schemas.Comment])
def get_pin_comments(
    pin_id: int,
    db: Session = Depends(get_db)
):
    """Get all comments for a specific pin."""
    return CommentService.get_comments_by_pin(db, pin_id)


@router.post("/pins/{pin_id}/comments", response_model=schemas.Comment, status_code=201)
def create_pin_comment(
    pin_id: int,
    comment_data: schemas.CommentCreate,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Add a new comment to a pin."""
    return CommentService.create_comment(db, pin_id, comment_data, user_id)

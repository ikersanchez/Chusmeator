"""API router for vote endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from app import schemas
from app.models import VoteModel, PinModel, AreaModel, PixelModel
from app.database import get_db
from app.dependencies import ensure_user_exists

router = APIRouter(prefix="/api", tags=["Votes"])

# Map target types to their models for existence checks
TARGET_MODELS = {
    "pin": PinModel,
    "area": AreaModel,
    "pixel": PixelModel,
}


@router.post("/votes", response_model=schemas.VoteResponse, status_code=201)
def create_vote(
    vote_data: schemas.VoteCreate,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Create a vote on a pin, area, or pixel. One vote per user per item."""
    # Verify target exists
    model = TARGET_MODELS.get(vote_data.targetType)
    if not model:
        raise HTTPException(status_code=400, detail="Invalid target type")

    target = db.query(model).filter(model.id == vote_data.targetId).first()
    if not target:
        raise HTTPException(status_code=404, detail=f"{vote_data.targetType.capitalize()} not found")

    vote_id = int(datetime.now().timestamp() * 1000000)

    db_vote = VoteModel(
        id=vote_id,
        user_id=user_id,
        target_type=vote_data.targetType,
        target_id=vote_data.targetId,
    )

    try:
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="You have already voted on this item")

    return schemas.VoteResponse(
        id=db_vote.id,
        userId=db_vote.user_id,
        targetType=db_vote.target_type,
        targetId=db_vote.target_id,
        createdAt=db_vote.created_at,
    )


@router.delete("/votes/{target_type}/{target_id}", response_model=schemas.SuccessResponse)
def delete_vote(
    target_type: str,
    target_id: int,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Remove the calling user's vote from an item."""
    if target_type not in TARGET_MODELS:
        raise HTTPException(status_code=400, detail="Invalid target type")

    vote = db.query(VoteModel).filter(
        VoteModel.user_id == user_id,
        VoteModel.target_type == target_type,
        VoteModel.target_id == target_id,
    ).first()

    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")

    db.delete(vote)
    db.commit()

    return schemas.SuccessResponse(success=True)

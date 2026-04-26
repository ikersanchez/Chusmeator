"""User API router — GDPR/ARCO rights endpoints.

Provides endpoints for users to exercise their rights under RGPD (GDPR):
- Data access (right of access / portability)
- Account deletion (right to erasure / "right to be forgotten")
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any
from datetime import datetime
import logging

from app.database import get_db
from app.dependencies import ensure_user_exists
from app.models import (
    User, PinModel, AreaModel, CommentModel, VoteModel, ModerationLogModel
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user", tags=["User Rights (ARCO/RGPD)"])


# ── Response schemas ─────────────────────────────────────────────────────────

class UserDataExport(BaseModel):
    """Complete export of all data associated with a user."""
    user_id: str
    created_at: datetime | None
    pins: List[dict]
    areas: List[dict]
    comments: List[dict]
    votes: List[dict]
    moderation_logs: List[dict]


class DeleteAccountResponse(BaseModel):
    success: bool = True
    deleted_counts: dict


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/me/data", response_model=UserDataExport)
def export_user_data(
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db),
):
    """Export all data for the current user (RGPD Art. 15 — Right of access / Art. 20 — Portability)."""
    user = db.query(User).filter(User.id == user_id).first()
    
    pins = db.query(PinModel).filter(PinModel.user_id == user_id).all()
    areas = db.query(AreaModel).filter(AreaModel.user_id == user_id).all()
    comments = db.query(CommentModel).filter(CommentModel.user_id == user_id).all()
    votes = db.query(VoteModel).filter(VoteModel.user_id == user_id).all()
    mod_logs = db.query(ModerationLogModel).filter(ModerationLogModel.user_id == user_id).all()

    return UserDataExport(
        user_id=user_id,
        created_at=user.created_at if user else None,
        pins=[
            {"id": p.id, "lat": p.lat, "lng": p.lng, "text": p.text,
             "color": p.color, "created_at": str(p.created_at)}
            for p in pins
        ],
        areas=[
            {"id": a.id, "latlngs": a.latlngs, "text": a.text,
             "color": a.color, "font_size": a.font_size, "created_at": str(a.created_at)}
            for a in areas
        ],
        comments=[
            {"id": c.id, "target_type": c.target_type, "target_id": c.target_id,
             "text": c.text, "created_at": str(c.created_at)}
            for c in comments
        ],
        votes=[
            {"id": v.id, "target_type": v.target_type, "target_id": v.target_id,
             "value": v.value, "created_at": str(v.created_at)}
            for v in votes
        ],
        moderation_logs=[
            {"id": m.id, "action": m.action, "result": m.result,
             "created_at": str(m.created_at)}
            for m in mod_logs
        ],
    )


@router.delete("/me", response_model=DeleteAccountResponse)
def delete_account(
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db),
):
    """Delete the current user and ALL associated data (RGPD Art. 17 — Right to erasure).
    
    This permanently removes: user record, pins, areas, comments, votes, and moderation logs.
    This action is irreversible.
    """
    logger.info(f"ARCO: User {user_id} requested account deletion")
    
    counts = {}
    
    # Delete moderation logs
    counts["moderation_logs"] = db.query(ModerationLogModel).filter(
        ModerationLogModel.user_id == user_id
    ).delete()
    
    # Delete votes
    counts["votes"] = db.query(VoteModel).filter(
        VoteModel.user_id == user_id
    ).delete()
    
    # Delete comments
    counts["comments"] = db.query(CommentModel).filter(
        CommentModel.user_id == user_id
    ).delete()
    
    # Delete areas
    counts["areas"] = db.query(AreaModel).filter(
        AreaModel.user_id == user_id
    ).delete()
    
    # Delete pins
    counts["pins"] = db.query(PinModel).filter(
        PinModel.user_id == user_id
    ).delete()
    
    # Delete user record
    counts["user"] = db.query(User).filter(
        User.id == user_id
    ).delete()
    
    db.commit()
    
    logger.info(f"ARCO: Deleted all data for user {user_id}: {counts}")
    
    return DeleteAccountResponse(success=True, deleted_counts=counts)

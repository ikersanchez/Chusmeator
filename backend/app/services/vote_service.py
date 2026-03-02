from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func
from app.models import VoteModel
from app import schemas
from typing import List, Dict, Set, Optional

class VoteService:
    @staticmethod
    def get_vote_counts(db: Session, target_type: str) -> Dict[int, int]:
        """Get vote counts grouped by target_id for a given target_type."""
        rows = (
            db.query(VoteModel.target_id, sa_func.count(VoteModel.id))
            .filter(VoteModel.target_type == target_type)
            .group_by(VoteModel.target_id)
            .all()
        )
        return {target_id: count for target_id, count in rows}

    @staticmethod
    def get_user_votes(db: Session, target_type: str, user_id: Optional[str]) -> Set[int]:
        """Get set of target_ids that a user has voted on."""
        if not user_id:
            return set()
        rows = (
            db.query(VoteModel.target_id)
            .filter(VoteModel.target_type == target_type, VoteModel.user_id == user_id)
            .all()
        )
        return {r[0] for r in rows}

    @staticmethod
    def create_vote(db: Session, vote_data: schemas.VoteCreate, user_id: str) -> VoteModel:
        db_vote = VoteModel(
            user_id=user_id,
            target_type=vote_data.target_type,
            target_id=vote_data.target_id
        )
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        return db_vote

    @staticmethod
    def delete_vote(db: Session, target_type: str, target_id: int, user_id: str) -> bool:
        vote = db.query(VoteModel).filter(
            VoteModel.target_type == target_type,
            VoteModel.target_id == target_id,
            VoteModel.user_id == user_id
        ).first()
        if not vote:
            return False
        db.delete(vote)
        db.commit()
        return True

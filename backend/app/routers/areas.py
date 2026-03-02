from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas
from app.database import get_db
from app.dependencies import ensure_user_exists
from app.services.area_service import AreaService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Areas"])


@router.post("/areas", response_model=schemas.Area, status_code=201)
def create_area(
    area_data: schemas.AreaCreate,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Create a new area."""
    try:
        logger.info(f"Creating area for user {user_id}: {area_data.text}")
        db_area = AreaService.create_area(db, area_data, user_id)
        return db_area
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ERROR creating area: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/areas/{area_id}", response_model=schemas.SuccessResponse)
def delete_area(
    area_id: int,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Delete an area. Only the owner can delete their own areas."""
    success = AreaService.delete_area(db, area_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Area not found")
    
    return schemas.SuccessResponse(success=True)

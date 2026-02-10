"""API router for area endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import schemas
from app.models import AreaModel
from app.database import get_db
from app.dependencies import ensure_user_exists
import traceback
import sys

router = APIRouter(prefix="/api", tags=["Areas"])


@router.post("/areas", response_model=schemas.Area, status_code=201)
def create_area(
    area_data: schemas.AreaCreate,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Create a new area."""
    try:
        print(f"DEBUG: Creating area for user {user_id}: {area_data.text}")
        # Generate ID from timestamp (microsecond resolution like pixels)
        area_id = int(datetime.now().timestamp() * 1000000)
        
        db_area = AreaModel(
            id=area_id,
            latlngs=area_data.latlngs,
            color=area_data.color,
            text=area_data.text,
            font_size=area_data.fontSize,
            user_id=user_id
        )
        
        db.add(db_area)
        db.commit()
        db.refresh(db_area)
        
        print(f"DEBUG: Successfully created area {area_id}")
        
        # Convert to response schema with camelCase field names
        return schemas.Area(
            id=db_area.id,
            latlngs=db_area.latlngs,
            color=db_area.color,
            text=db_area.text,
            fontSize=db_area.font_size,
            userId=db_area.user_id,
            createdAt=db_area.created_at
        )
    except Exception as e:
        print(f"ERROR creating area: {str(e)}", file=sys.stderr)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/areas/{area_id}", response_model=schemas.SuccessResponse)
def delete_area(
    area_id: int,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Delete an area. Only the owner can delete their own areas."""
    area = db.query(AreaModel).filter(AreaModel.id == area_id).first()
    
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    
    if area.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: You can only delete your own areas"
        )
    
    db.delete(area)
    db.commit()
    
    return schemas.SuccessResponse(success=True)

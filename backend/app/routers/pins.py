"""API router for pin endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import schemas
from app.models import PinModel
from app.database import get_db
from app.dependencies import ensure_user_exists

router = APIRouter(prefix="/api", tags=["Pins"])


@router.post("/pins", response_model=schemas.Pin, status_code=201)
def create_pin(
    pin_data: schemas.PinCreate,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Create a new pin."""
    print(f"DEBUG: Creating pin for user {user_id}: {pin_data.text}")
    # Generate ID from timestamp
    pin_id = int(datetime.now().timestamp() * 1000)
    
    db_pin = PinModel(
        id=pin_id,
        lat=pin_data.lat,
        lng=pin_data.lng,
        text=pin_data.text,
        user_id=user_id
    )
    
    db.add(db_pin)
    db.commit()
    db.refresh(db_pin)
    
    # Convert to response schema with camelCase field names
    return schemas.Pin(
        id=db_pin.id,
        lat=db_pin.lat,
        lng=db_pin.lng,
        text=db_pin.text,
        userId=db_pin.user_id,
        createdAt=db_pin.created_at
    )


@router.delete("/pins/{pin_id}", response_model=schemas.SuccessResponse)
def delete_pin(
    pin_id: int,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Delete a pin. Only the owner can delete their own pins."""
    pin = db.query(PinModel).filter(PinModel.id == pin_id).first()
    
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    
    if pin.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: You can only delete your own pins"
        )
    
    db.delete(pin)
    db.commit()
    
    return schemas.SuccessResponse(success=True)

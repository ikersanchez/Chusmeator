"""API router for pixel endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import schemas
from app.models import PixelModel
from app.database import get_db
from app.dependencies import ensure_user_exists
import random

router = APIRouter(prefix="/api", tags=["Pixels"])


@router.get("/pixels", response_model=list[schemas.Pixel])
def get_pixels(db: Session = Depends(get_db)):
    """Get all pixels."""
    pixels = db.query(PixelModel).all()
    
    return [
        schemas.Pixel(
            id=pixel.id,
            lat=pixel.lat,
            lng=pixel.lng,
            color=pixel.color,
            text=pixel.text,
            userId=pixel.user_id,
            createdAt=pixel.created_at,
            updatedAt=pixel.updated_at
        )
        for pixel in pixels
    ]


@router.post("/pixels", response_model=schemas.Pixel, status_code=201)
def create_pixel(
    pixel_data: schemas.PixelCreate,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Create a new pixel."""
    print(f"DEBUG: Creating pixel for user {user_id} at {pixel_data.lat}, {pixel_data.lng}")
    # Generate unique ID from timestamp + random suffix
    pixel_id = int(datetime.now().timestamp() * 1000000)
    
    db_pixel = PixelModel(
        id=pixel_id,
        lat=pixel_data.lat,
        lng=pixel_data.lng,
        color=pixel_data.color,
        text=pixel_data.text,
        user_id=user_id
    )
    
    db.add(db_pixel)
    db.commit()
    db.refresh(db_pixel)
    
    return schemas.Pixel(
        id=db_pixel.id,
        lat=db_pixel.lat,
        lng=db_pixel.lng,
        color=db_pixel.color,
        text=db_pixel.text,
        userId=db_pixel.user_id,
        createdAt=db_pixel.created_at,
        updatedAt=db_pixel.updated_at
    )


@router.put("/pixels/{pixel_id}", response_model=schemas.Pixel)
def update_pixel(
    pixel_id: int,
    pixel_data: schemas.PixelUpdate,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Update an existing pixel. Only the owner can update their own pixels."""
    pixel = db.query(PixelModel).filter(PixelModel.id == pixel_id).first()
    
    if not pixel:
        raise HTTPException(status_code=404, detail="Pixel not found")
    
    if pixel.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: You can only update your own pixels"
        )
    
    # Update fields if provided
    if pixel_data.lat is not None:
        pixel.lat = pixel_data.lat
    if pixel_data.lng is not None:
        pixel.lng = pixel_data.lng
    if pixel_data.color is not None:
        pixel.color = pixel_data.color
    if pixel_data.text is not None:
        pixel.text = pixel_data.text
    
    db.commit()
    db.refresh(pixel)
    
    return schemas.Pixel(
        id=pixel.id,
        lat=pixel.lat,
        lng=pixel.lng,
        color=pixel.color,
        text=pixel.text,
        userId=pixel.user_id,
        createdAt=pixel.created_at,
        updatedAt=pixel.updated_at
    )


@router.delete("/pixels/{pixel_id}", response_model=schemas.SuccessResponse)
def delete_pixel(
    pixel_id: int,
    user_id: str = Depends(ensure_user_exists),
    db: Session = Depends(get_db)
):
    """Delete a pixel. Only the owner can delete their own pixels."""
    pixel = db.query(PixelModel).filter(PixelModel.id == pixel_id).first()
    
    if not pixel:
        raise HTTPException(status_code=404, detail="Pixel not found")
    
    if pixel.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: You can only delete your own pixels"
        )
    
    db.delete(pixel)
    db.commit()
    
    return schemas.SuccessResponse(success=True)

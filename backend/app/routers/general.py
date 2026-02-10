"""API router for general endpoints (user, map-data, search)."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import httpx
from app import schemas
from app.models import PinModel, AreaModel, PixelModel
from app.database import get_db
from app.dependencies import get_current_user_id
from app.config import settings

router = APIRouter(prefix="/api", tags=["General"])


@router.get("/user", response_model=schemas.UserIdResponse)
def get_user_id(user_id: str = Depends(get_current_user_id)):
    """Get current user ID from header."""
    return schemas.UserIdResponse(userId=user_id)


@router.get("/map-data", response_model=schemas.MapData)
def get_map_data(db: Session = Depends(get_db)):
    """Get all map data (pins, areas, and pixels)."""
    # Get all pins
    pins = db.query(PinModel).all()
    pin_list = [
        schemas.Pin(
            id=pin.id,
            lat=pin.lat,
            lng=pin.lng,
            text=pin.text,
            userId=pin.user_id,
            createdAt=pin.created_at
        )
        for pin in pins
    ]
    
    # Get all areas
    areas = db.query(AreaModel).all()
    area_list = [
        schemas.Area(
            id=area.id,
            latlngs=area.latlngs,
            color=area.color,
            text=area.text,
            fontSize=area.font_size,
            userId=area.user_id,
            createdAt=area.created_at
        )
        for area in areas
    ]
    
    # Get all pixels
    pixels = db.query(PixelModel).all()
    pixel_list = [
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
    
    return schemas.MapData(pins=pin_list, areas=area_list, pixels=pixel_list)


@router.get("/search", response_model=List[schemas.SearchResult])
async def search_address(q: str = Query(..., description="Search query")):
    """
    Search for addresses using OpenStreetMap Nominatim.
    Proxies the request to avoid CORS issues.
    """
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Search query is required")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.nominatim_url}/search",
                params={"format": "json", "q": q},
                headers={"User-Agent": "Chusmeator/1.0"},
                timeout=10.0
            )
            response.raise_for_status()
            results = response.json()
            
            return [
                schemas.SearchResult(
                    lat=float(item["lat"]),
                    lon=float(item["lon"]),
                    display_name=item["display_name"]
                )
                for item in results
            ]
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

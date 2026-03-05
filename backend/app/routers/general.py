"""API router for general endpoints (user, map-data, search)."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
from app import schemas
from app.database import get_db
from app.dependencies import get_current_user_id
from app.config import settings
from app.services.pin_service import PinService
from app.services.area_service import AreaService
from app.services.vote_service import VoteService

router = APIRouter(prefix="/api", tags=["General"])


@router.get("/user", response_model=schemas.UserIdResponse)
def get_user_id(user_id: str = Depends(get_current_user_id)):
    """Get current user ID from header."""
    return schemas.UserIdResponse(user_id=user_id)


@router.get("/map-data", response_model=schemas.MapData)
def get_map_data(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get all map data (pins and areas) with vote counts."""
    # Vote aggregations
    pin_votes = VoteService.get_vote_counts(db, "pin")
    area_votes = VoteService.get_vote_counts(db, "area")
    pin_user_votes = VoteService.get_user_votes(db, "pin", user_id)
    area_user_votes = VoteService.get_user_votes(db, "area", user_id)

    # Get all pins
    pins = PinService.get_all_pins(db)
    pin_list = [
        schemas.Pin(
            id=pin.id,
            lat=pin.lat,
            lng=pin.lng,
            text=pin.text,
            color=pin.color,
            user_id=pin.user_id,
            created_at=pin.created_at,
            votes=pin_votes.get(pin.id, 0),
            user_voted=pin.id in pin_user_votes,
        )
        for pin in pins
    ]

    # Get all areas
    areas = AreaService.get_all_areas(db)
    area_list = [
        schemas.Area(
            id=area.id,
            latlngs=area.latlngs,
            color=area.color,
            text=area.text,
            font_size=area.font_size,
            user_id=area.user_id,
            created_at=area.created_at,
            votes=area_votes.get(area.id, 0),
            user_voted=area.id in area_user_votes,
        )
        for area in areas
    ]

    return schemas.MapData(pins=pin_list, areas=area_list)


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
                headers={"User-Agent": "ChusmeatorApp/1.0 (contact@chusmeator.com)"},
                timeout=10.0
            )
            
            if response.status_code != 200:
                print(f"DEBUG: Nominatim search failed with status {response.status_code}: {response.text}")
                
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
    except httpx.HTTPStatusError as e:
        detail = f"Search service error ({e.response.status_code})"
        if e.response.status_code == 403:
            detail = "Search unavailable from this server (IP blocked by Nominatim). Try again later."
        elif e.response.status_code == 429:
            detail = "Search rate limit exceeded. Please wait a moment."
            
        print(f"ERROR: Search failed for '{q}': {str(e)}")
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    except Exception as e:
        print(f"ERROR: Unexpected search failure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

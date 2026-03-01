"""API router for general endpoints (user, map-data, search)."""
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func
from typing import List, Optional
import httpx
from app import schemas
from app.models import PinModel, AreaModel, VoteModel
from app.database import get_db
from app.dependencies import get_current_user_id
from app.config import settings

router = APIRouter(prefix="/api", tags=["General"])


@router.get("/user", response_model=schemas.UserIdResponse)
def get_user_id(user_id: str = Depends(get_current_user_id)):
    """Get current user ID from header."""
    return schemas.UserIdResponse(userId=user_id)


def _get_vote_counts(db: Session, target_type: str):
    """Get vote counts grouped by target_id for a given target_type."""
    rows = (
        db.query(VoteModel.target_id, sa_func.count(VoteModel.id))
        .filter(VoteModel.target_type == target_type)
        .group_by(VoteModel.target_id)
        .all()
    )
    return {target_id: count for target_id, count in rows}


def _get_user_votes(db: Session, target_type: str, user_id: Optional[str]):
    """Get set of target_ids that a user has voted on."""
    if not user_id:
        return set()
    rows = (
        db.query(VoteModel.target_id)
        .filter(VoteModel.target_type == target_type, VoteModel.user_id == user_id)
        .all()
    )
    return {r[0] for r in rows}


@router.get("/map-data", response_model=schemas.MapData)
def get_map_data(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    """Get all map data (pins and areas) with vote counts."""
    # Vote aggregations
    pin_votes = _get_vote_counts(db, "pin")
    area_votes = _get_vote_counts(db, "area")
    pin_user_votes = _get_user_votes(db, "pin", x_user_id)
    area_user_votes = _get_user_votes(db, "area", x_user_id)

    # Get all pins
    pins = db.query(PinModel).all()
    pin_list = [
        schemas.Pin(
            id=pin.id,
            lat=pin.lat,
            lng=pin.lng,
            text=pin.text,
            color=pin.color,
            userId=pin.user_id,
            createdAt=pin.created_at,
            votes=pin_votes.get(pin.id, 0),
            userVoted=pin.id in pin_user_votes,
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
            createdAt=area.created_at,
            votes=area_votes.get(area.id, 0),
            userVoted=area.id in area_user_votes,
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

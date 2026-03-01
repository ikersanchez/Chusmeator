"""Pydantic schemas matching the OpenAPI specification."""
from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


# Pin Schemas
class PinCreate(BaseModel):
    """Schema for creating a new pin."""
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    text: str = Field(..., description="Pin description text")
    color: str = Field("blue", pattern="^(blue|green|red)$")


class Pin(BaseModel):
    """Schema for a pin response."""
    id: int
    lat: float
    lng: float
    text: str
    color: str
    userId: str
    createdAt: datetime
    votes: int = 0
    userVoted: bool = False
    
    class Config:
        from_attributes = True


# Area Schemas
class AreaCreate(BaseModel):
    """Schema for creating a new area."""
    latlngs: List[Any]  # Flexible for different Leaflet structures
    color: str = Field(..., pattern="^(blue|green|red)$")
    text: str
    fontSize: str


class Area(BaseModel):
    """Schema for an area response."""
    id: int
    latlngs: List[Any]
    color: str
    text: str
    fontSize: str
    userId: str
    createdAt: datetime
    votes: int = 0
    userVoted: bool = False
    
    class Config:
        from_attributes = True


# Map Data Schema
class MapData(BaseModel):
    """Schema for all map data."""
    pins: List[Pin]
    areas: List[Area]



# User Schema
class UserIdResponse(BaseModel):
    """Schema for user ID response."""
    userId: str


# Search Schemas
class SearchResult(BaseModel):
    """Schema for search result."""
    lat: float
    lon: float  # Note: Nominatim uses 'lon' not 'lng'
    display_name: str


# Error Schema
class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str
    detail: Optional[str] = None


# Success Schema
class SuccessResponse(BaseModel):
    """Schema for successful deletion."""
    success: bool = True


# Vote Schemas
class VoteCreate(BaseModel):
    """Schema for creating a vote."""
    targetType: str = Field(..., pattern="^(pin|area)$")
    targetId: int


class VoteResponse(BaseModel):
    """Schema for a vote response."""
    id: int
    userId: str
    targetType: str
    targetId: int
    createdAt: datetime

    class Config:
        from_attributes = True

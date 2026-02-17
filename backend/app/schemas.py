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


class Pin(BaseModel):
    """Schema for a pin response."""
    id: int
    lat: float
    lng: float
    text: str
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


# Pixel Schemas
class PixelCreate(BaseModel):
    """Schema for creating a new pixel."""
    lat: float
    lng: float
    color: str = Field(..., pattern="^(red|green|blue)$")
    text: str


class PixelUpdate(BaseModel):
    """Schema for updating a pixel."""
    lat: Optional[float] = None
    lng: Optional[float] = None
    color: Optional[str] = Field(None, pattern="^(red|green|blue)$")
    text: Optional[str] = None


class Pixel(BaseModel):
    """Schema for a pixel response."""
    id: int
    lat: float
    lng: float
    color: str
    text: str
    userId: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    votes: int = 0
    userVoted: bool = False
    
    class Config:
        from_attributes = True


# Map Data Schema
class MapData(BaseModel):
    """Schema for all map data."""
    pins: List[Pin]
    areas: List[Area]
    pixels: List[Pixel]


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
    targetType: str = Field(..., pattern="^(pin|area|pixel)$")
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

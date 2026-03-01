from sqlalchemy import Column, String, Float, Integer, BigInteger, Text, DateTime, ForeignKey, JSON, CheckConstraint, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class VoteModel(Base):
    """Vote model for community voting on pins, areas, and pixels."""
    __tablename__ = "votes"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    target_type = Column(String(10), nullable=False)  # "pin", "area"
    target_id = Column(BigInteger, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("target_type IN ('pin', 'area')", name="check_vote_target_type"),
        UniqueConstraint("user_id", "target_type", "target_id", name="uq_vote"),
    )


class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PinModel(Base):
    """Pin model for map pins with location and text."""
    __tablename__ = "pins"
    
    id = Column(BigInteger, primary_key=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    color = Column(String(10), nullable=False, default='blue')
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("color IN ('blue', 'green', 'red')", name="check_pin_color"),
    )


class AreaModel(Base):
    """Area model for polygonal regions with color and label."""
    __tablename__ = "areas"
    
    id = Column(BigInteger, primary_key=True)
    latlngs = Column(JSON, nullable=False)  # Store as JSON
    color = Column(String(10), nullable=False)
    text = Column(Text, nullable=False)
    font_size = Column(String(10), nullable=False)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("color IN ('blue', 'green', 'red')", name="check_area_color"),
    )


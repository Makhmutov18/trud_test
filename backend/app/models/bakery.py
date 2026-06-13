from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON

from app.database import Base


class BakeryItem(Base):
    __tablename__ = "bakery_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=False, comment="Состав (для аллергиков)")
    price = Column(Float, nullable=False)
    photo_url = Column(String(512), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    available_days = Column(JSON, nullable=True, comment='["mon","tue",...]')
    season = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

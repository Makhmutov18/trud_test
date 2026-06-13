from datetime import datetime

from pydantic import BaseModel


class BakeryItemCreate(BaseModel):
    name: str
    description: str | None = None
    ingredients: str
    price: float
    photo_url: str | None = None
    available_days: list[str] | None = None
    season: str | None = None


class BakeryItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    ingredients: str | None = None
    price: float | None = None
    photo_url: str | None = None
    is_available: bool | None = None
    available_days: list[str] | None = None
    season: str | None = None


class BakeryItemOut(BaseModel):
    id: int
    name: str
    description: str | None
    ingredients: str
    price: float
    photo_url: str | None
    is_available: bool
    available_days: list[str] | None
    season: str | None

    model_config = {"from_attributes": True}

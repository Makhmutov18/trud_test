from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    telegram_id: str
    name: str | None
    username: str | None
    role: str

    model_config = {"from_attributes": True}


class LotCreate(BaseModel):
    name: str
    country: str
    region: str | None = None
    farm: str | None = None
    process: str | None = None
    roast_date: date | None = None
    flavor_profile: str | None = None


class LotOut(BaseModel):
    id: int
    name: str
    country: str
    region: str | None
    farm: str | None
    process: str | None
    roast_date: date | None
    flavor_profile: str | None
    is_available: bool

    model_config = {"from_attributes": True}


class RecipeCreate(BaseModel):
    name: str
    type: str = "pourover"
    lot_id: int | None = None
    bean_variety: str
    roaster: str | None = None
    dose: float
    dripper_type: str | None = None
    grinder_model: str | None = None
    grind_setting: str | None = None
    total_water: float
    water_temp: float | None = None
    brew_time: int | None = None
    pour_steps: list[dict] | None = None
    instructions: str | None = None
    espresso_yield: float | None = None
    pump_profile: str | None = None


class RecipeUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    lot_id: int | None = None
    bean_variety: str | None = None
    roaster: str | None = None
    dose: float | None = None
    dripper_type: str | None = None
    grinder_model: str | None = None
    grind_setting: str | None = None
    total_water: float | None = None
    water_temp: float | None = None
    brew_time: int | None = None
    pour_steps: list[dict] | None = None
    instructions: str | None = None
    espresso_yield: float | None = None
    pump_profile: str | None = None
    is_active: bool | None = None


class RecipeOut(BaseModel):
    id: int
    name: str
    type: str
    lot_id: int | None
    bean_variety: str
    roaster: str | None
    dose: float
    dripper_type: str | None
    grinder_model: str | None
    grind_setting: str | None
    total_water: float
    water_temp: float | None
    brew_time: int | None
    pour_steps: list[dict] | None
    instructions: str | None
    espresso_yield: float | None
    pump_profile: str | None
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TeaCreate(BaseModel):
    name: str
    type: str
    origin: str | None = None
    brew_temp: float | None = None
    brew_time: int | None = None
    dose: float | None = None
    description: str | None = None


class TeaOut(BaseModel):
    id: int
    name: str
    type: str
    origin: str | None
    brew_temp: float | None
    brew_time: int | None
    dose: float | None
    description: str | None
    is_available: bool

    model_config = {"from_attributes": True}


class BrewLogCreate(BaseModel):
    recipe_id: int | None = None
    coffee_beans: str
    method: str
    weight_in: float
    weight_out: float
    brew_time: int
    temperature: float | None = None
    tds: float | None = None
    extraction: float | None = None
    weight_timeline: list[dict] | None = None
    notes: str | None = None


class BrewLogOut(BaseModel):
    id: int
    recipe_id: int | None
    user_id: int
    coffee_beans: str
    method: str
    weight_in: float
    weight_out: float
    brew_time: int
    temperature: float | None
    tds: float | None
    extraction: float | None
    status: str
    weight_timeline: list[dict] | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

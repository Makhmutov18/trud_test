import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Date, Float, ForeignKey, Integer, String, Text,
)
from sqlalchemy.dialects.postgresql import JSON

from app.database import Base


class RecipeType(str, enum.Enum):
    pourover = "pourover"
    espresso = "espresso"
    batch = "batch"
    latte = "latte"


class BrewStatus(str, enum.Enum):
    within_spec = "within_spec"
    out_of_limits = "out_of_limits"


class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    country = Column(String(128), nullable=False)
    region = Column(String(128), nullable=True)
    farm = Column(String(255), nullable=True)
    process = Column(String(64), nullable=True)
    roast_date = Column(Date, nullable=True)
    flavor_profile = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(16), nullable=False, default=RecipeType.pourover.value)

    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=True)
    bean_variety = Column(String(255), nullable=False)
    roaster = Column(String(255), nullable=True)
    dose = Column(Float, nullable=False, comment="Вес зерна, г")

    dripper_type = Column(String(32), nullable=True)
    grinder_model = Column(String(128), nullable=True)
    grind_setting = Column(String(64), nullable=True)

    total_water = Column(Float, nullable=False, comment="Объём воды, мл")
    water_temp = Column(Float, nullable=True, comment="Температура воды, °C")

    brew_time = Column(Integer, nullable=True, comment="Общее время, сек")
    pour_steps = Column(JSON, nullable=True, comment="Шаги заливки (для pourover)")

    instructions = Column(Text, nullable=True, comment="Текстовый рецепт приготовления")

    espresso_yield = Column(Float, nullable=True, comment="Вес выхода, г")
    pump_profile = Column(String(128), nullable=True, comment="Профиль давления")

    is_active = Column(Boolean, default=True, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Tea(Base):
    __tablename__ = "teas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(32), nullable=False, comment="green, black, oolong, herbal")
    origin = Column(String(128), nullable=True)
    brew_temp = Column(Float, nullable=True)
    brew_time = Column(Integer, nullable=True, comment="Сек")
    dose = Column(Float, nullable=True, comment="Граммы")
    description = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class BrewLog(Base):
    __tablename__ = "brew_logs"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    coffee_beans = Column(String(255), nullable=False)
    method = Column(String(64), nullable=False)
    weight_in = Column(Float, nullable=False)
    weight_out = Column(Float, nullable=False)
    brew_time = Column(Integer, nullable=False)
    temperature = Column(Float, nullable=True)

    tds = Column(Float, nullable=True)
    extraction = Column(Float, nullable=True)
    status = Column(String(32), default=BrewStatus.within_spec.value, nullable=False)

    weight_timeline = Column(JSON, nullable=True, comment="Timemore data: [{time_ms, weight_g}]")
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

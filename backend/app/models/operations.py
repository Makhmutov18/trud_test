from datetime import date, datetime, time

from sqlalchemy import (
    Boolean, Column, DateTime, Date, Float, ForeignKey, Integer, String, Text, Time,
)
from sqlalchemy.dialects.postgresql import JSON

from app.database import Base


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    role = Column(String(32), nullable=False, default="barista")
    status = Column(String(32), nullable=False, default="scheduled")
    swap_with_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class TemperatureLog(Base):
    __tablename__ = "temperature_logs"

    id = Column(Integer, primary_key=True, index=True)
    fridge_number = Column(Integer, nullable=False)
    temperature = Column(Float, nullable=False)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_alarm = Column(Boolean, default=False, nullable=False)


class Checklist(Base):
    __tablename__ = "checklists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(32), nullable=False, comment="opening, closing, cleaning, toilet")
    frequency = Column(String(32), nullable=False, comment="daily, per_shift, hourly")
    items = Column(JSON, nullable=False, comment="[{text: str, done: bool}]")
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    date = Column(Date, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    remind_at = Column(DateTime, nullable=False)
    repeat = Column(String(32), nullable=True, comment="daily, weekly, interval")
    is_completed = Column(Boolean, default=False, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

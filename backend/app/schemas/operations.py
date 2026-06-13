from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel


class ShiftCreate(BaseModel):
    user_id: int
    date: date
    start_time: time
    end_time: time
    role: str = "barista"


class ShiftUpdate(BaseModel):
    start_time: time | None = None
    end_time: time | None = None
    status: str | None = None
    swap_with_id: int | None = None


class ShiftOut(BaseModel):
    id: int
    user_id: int
    date: date
    start_time: time
    end_time: time
    role: str
    status: str
    swap_with_id: int | None

    model_config = {"from_attributes": True}


class TemperatureLogCreate(BaseModel):
    fridge_number: int
    temperature: float


class TemperatureLogOut(BaseModel):
    id: int
    fridge_number: int
    temperature: float
    recorded_by: int
    recorded_at: datetime
    is_alarm: bool

    model_config = {"from_attributes": True}


class ChecklistItem(BaseModel):
    text: str
    done: bool = False


class ChecklistCreate(BaseModel):
    name: str
    type: str
    frequency: str
    items: list[ChecklistItem]
    assigned_to: int | None = None


class ChecklistUpdate(BaseModel):
    items: list[ChecklistItem] | None = None
    completed_at: datetime | None = None


class ChecklistOut(BaseModel):
    id: int
    name: str
    type: str
    frequency: str
    items: list[dict]
    assigned_to: int | None
    date: date
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class ReminderCreate(BaseModel):
    title: str
    description: str | None = None
    remind_at: datetime
    repeat: str | None = None


class ReminderOut(BaseModel):
    id: int
    title: str
    description: str | None
    remind_at: datetime
    repeat: str | None
    is_completed: bool
    created_by: int

    model_config = {"from_attributes": True}

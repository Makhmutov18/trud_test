from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.operations import Shift, TemperatureLog, Checklist, Reminder
from app.schemas.operations import (
    ShiftCreate, ShiftUpdate, ShiftOut,
    TemperatureLogCreate, TemperatureLogOut,
    ChecklistCreate, ChecklistUpdate, ChecklistOut,
    ReminderCreate, ReminderOut,
)

router = APIRouter(prefix="/api/operations", tags=["operations"])


# ── Shifts ──


@router.get("/shifts", response_model=list[ShiftOut])
async def list_shifts(
    start_date: date | None = None,
    end_date: date | None = None,
    user_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Shift)
    if start_date:
        query = query.where(Shift.date >= start_date)
    if end_date:
        query = query.where(Shift.date <= end_date)
    if user_id:
        query = query.where(Shift.user_id == user_id)
    query = query.order_by(Shift.date, Shift.start_time)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/shifts", response_model=ShiftOut, status_code=201)
async def create_shift(data: ShiftCreate, db: AsyncSession = Depends(get_db)):
    shift = Shift(**data.model_dump())
    db.add(shift)
    await db.commit()
    await db.refresh(shift)
    return shift


@router.put("/shifts/{shift_id}", response_model=ShiftOut)
async def update_shift(shift_id: int, data: ShiftUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Shift).where(Shift.id == shift_id))
    shift = result.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(shift, k, v)
    await db.commit()
    await db.refresh(shift)
    return shift


@router.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Shift).where(Shift.id == shift_id))
    shift = result.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    await db.delete(shift)
    await db.commit()
    return {"message": "Deleted"}


# ── Temperature ──


@router.get("/temperature", response_model=list[TemperatureLogOut])
async def list_temperature_logs(
    fridge_number: int | None = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    query = select(TemperatureLog)
    if fridge_number:
        query = query.where(TemperatureLog.fridge_number == fridge_number)
    query = query.order_by(TemperatureLog.recorded_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/temperature", response_model=TemperatureLogOut, status_code=201)
async def create_temperature_log(
    data: TemperatureLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_alarm = data.temperature < 0 or data.temperature > 8
    log = TemperatureLog(
        fridge_number=data.fridge_number,
        temperature=data.temperature,
        recorded_by=current_user.id,
        is_alarm=is_alarm,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


# ── Checklists ──


@router.get("/checklists", response_model=list[ChecklistOut])
async def list_checklists(
    checklist_type: str | None = None,
    target_date: date | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Checklist)
    if checklist_type:
        query = query.where(Checklist.type == checklist_type)
    if target_date:
        query = query.where(Checklist.date == target_date)
    else:
        query = query.where(Checklist.date == date.today())
    query = query.order_by(Checklist.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/checklists", response_model=ChecklistOut, status_code=201)
async def create_checklist(
    data: ChecklistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    checklist = Checklist(
        **data.model_dump(),
        date=date.today(),
    )
    db.add(checklist)
    await db.commit()
    await db.refresh(checklist)
    return checklist


@router.put("/checklists/{checklist_id}", response_model=ChecklistOut)
async def update_checklist(
    checklist_id: int,
    data: ChecklistUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Checklist).where(Checklist.id == checklist_id))
    checklist = result.scalar_one_or_none()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(checklist, k, v)
    await db.commit()
    await db.refresh(checklist)
    return checklist


# ── Reminders ──


@router.get("/reminders", response_model=list[ReminderOut])
async def list_reminders(
    show_completed: bool = False,
    db: AsyncSession = Depends(get_db),
):
    query = select(Reminder)
    if not show_completed:
        query = query.where(Reminder.is_completed == False)
    query = query.order_by(Reminder.remind_at)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/reminders", response_model=ReminderOut, status_code=201)
async def create_reminder(
    data: ReminderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = Reminder(**data.model_dump(), created_by=current_user.id)
    db.add(reminder)
    await db.commit()
    await db.refresh(reminder)
    return reminder


@router.put("/reminders/{reminder_id}/complete")
async def complete_reminder(reminder_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Reminder).where(Reminder.id == reminder_id))
    reminder = result.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    reminder.is_completed = True
    await db.commit()
    return {"message": "Completed"}

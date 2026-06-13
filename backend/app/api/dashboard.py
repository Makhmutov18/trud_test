from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.coffee import BrewLog
from app.models.operations import Shift, TemperatureLog, Checklist, Reminder
from app.models.bakery import BakeryItem

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    shifts_result = await db.execute(
        select(Shift).where(Shift.date == today)
    )
    shifts = shifts_result.scalars().all()

    logs_result = await db.execute(
        select(BrewLog)
        .where(BrewLog.created_at >= datetime.combine(today, datetime.min.time()))
        .where(BrewLog.user_id == current_user.id)
    )
    brew_logs = logs_result.scalars().all()

    temp_result = await db.execute(
        select(TemperatureLog)
        .where(TemperatureLog.recorded_at >= datetime.combine(today, datetime.min.time()))
        .order_by(TemperatureLog.recorded_at.desc())
        .limit(20)
    )
    temps = temp_result.scalars().all()

    checklists_result = await db.execute(
        select(Checklist).where(Checklist.date == today)
    )
    checklists = checklists_result.scalars().all()

    reminders_result = await db.execute(
        select(Reminder).where(Reminder.is_completed == False)
    )
    reminders = reminders_result.scalars().all()

    return {
        "date": today.isoformat(),
        "shifts": [
            {"id": s.id, "user_id": s.user_id, "start": str(s.start_time), "end": str(s.end_time), "status": s.status}
            for s in shifts
        ],
        "brew_stats": {
            "total": len(brew_logs),
            "within_spec": sum(1 for l in brew_logs if l.status == "within_spec"),
            "out_of_limits": sum(1 for l in brew_logs if l.status == "out_of_limits"),
        },
        "temperatures": [
            {"fridge": t.fridge_number, "temp": t.temperature, "alarm": t.is_alarm, "time": str(t.recorded_at)}
            for t in temps
        ],
        "checklists": [
            {"id": c.id, "name": c.name, "type": c.type, "done": c.completed_at is not None}
            for c in checklists
        ],
        "pending_reminders": len(reminders),
    }

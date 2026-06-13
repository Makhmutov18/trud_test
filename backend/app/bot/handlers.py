import logging
import os

from aiogram import Bot, Dispatcher, Router, F
from aiogram.filters import Command, CommandObject
from aiogram.types import Message
from dotenv import load_dotenv
from sqlalchemy import select

from app.config import settings
from app.database import async_session, init_db
from app.models.user import User
from app.models.operations import TemperatureLog, Reminder

load_dotenv()

logger = logging.getLogger(__name__)
router = Router()

import re

WEBAPP_URL = settings.WEBAPP_URL

# Telegram requires HTTPS for Web App buttons — validate the URL
_IS_VALID_WEBAPP_URL = bool(
    WEBAPP_URL and re.match(r"^https://", WEBAPP_URL)
)


@router.message(Command("start"))
async def cmd_start(message: Message):
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

    telegram_id = str(message.from_user.id)

    async with async_session() as db:
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                telegram_id=telegram_id,
                name=message.from_user.first_name,
                username=message.from_user.username,
            )
            db.add(user)
            await db.commit()

    if _IS_VALID_WEBAPP_URL:
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Открыть ТРУД", web_app=WebAppInfo(url=WEBAPP_URL))]
        ])
        await message.answer(
            f"Добро пожаловать в <b>ТРУД</b>!\n\n"
            f"Здесь ты можешь управлять рецептами, сменами и чек-листами.\n\n"
            f"Нажми кнопку ниже, чтобы открыть приложение:",
            reply_markup=kb,
        )
    else:
        await message.answer(
            f"Добро пожаловать в <b>ТРУД</b>!\n\n"
            f"Веб-приложение пока недоступно. Используй команды:\n"
            f"/trtemp — лог температуры\n"
            f"/shift — смена на сегодня\n"
            f"/checklist — чек-листы\n"
            f"/remind — напоминание\n"
            f"/help — справка"
        )


@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "📋 <b>Команды бота ТРУД:</b>\n\n"
        "/start — открыть приложение\n"
        "/trtemp &lt;номер&gt; &lt;температура&gt; — лог температуры холодильника\n"
        "/shift — показать смену на сегодня\n"
        "/checklist — текущие чек-листы\n"
        "/remind &lt;текст&gt; — создать напоминание\n"
        "/help — эта справка"
    )


@router.message(Command("trtemp"))
async def cmd_trtemp(message: Message, command: CommandObject):
    args = (command.args or "").strip().split()
    if len(args) < 2:
        await message.answer("Формат: /trtemp &lt;номер_холодильника&gt; &lt;температура&gt;\nПример: /trtemp 1 4.5")
        return

    try:
        fridge_number = int(args[0])
        temperature = float(args[1])
    except ValueError:
        await message.answer("Неверный формат. Используй: /trtemp 1 4.5")
        return

    telegram_id = str(message.from_user.id)
    async with async_session() as db:
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            await message.answer("Сначала нажми /start")
            return

        is_alarm = temperature < 0 or temperature > 8
        log = TemperatureLog(
            fridge_number=fridge_number,
            temperature=temperature,
            recorded_by=user.id,
            is_alarm=is_alarm,
        )
        db.add(log)
        await db.commit()

    alarm_text = " ⚠️ ВНИМАНИЕ: температура вне нормы!" if is_alarm else ""
    await message.answer(
        f"✅ Температура записана:\n"
        f"Холодильник #{fridge_number}: {temperature}°C{alarm_text}"
    )


@router.message(Command("shift"))
async def cmd_shift(message: Message):
    from datetime import date as date_type
    telegram_id = str(message.from_user.id)

    async with async_session() as db:
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            await message.answer("Сначала нажми /start")
            return

        from app.models.operations import Shift
        today = date_type.today()
        shifts_result = await db.execute(
            select(Shift).where(Shift.date == today)
        )
        shifts = shifts_result.scalars().all()

    if not shifts:
        await message.answer(f"📅 На сегодня ({today.strftime('%d.%m')}) смен нет.")
        return

    lines = [f"📅 <b>Смены на {today.strftime('%d.%m')}:</b>\n"]
    for s in shifts:
        status_emoji = {"scheduled": "📋", "confirmed": "✅", "completed": "✔️", "swapped": "🔄"}.get(s.status, "")
        lines.append(f"{status_emoji} {s.start_time.strftime('%H:%M')}–{s.end_time.strftime('%H:%M')} (ID: {s.user_id})")
    await message.answer("\n".join(lines))


@router.message(Command("checklist"))
async def cmd_checklist(message: Message):
    from datetime import date as date_type

    async with async_session() as db:
        from app.models.operations import Checklist
        today = date_type.today()
        result = await db.execute(
            select(Checklist).where(Checklist.date == today)
        )
        checklists = result.scalars().all()

    if not checklists:
        await message.answer("✅ На сегодня чек-листов нет.")
        return

    lines = ["📋 <b>Чек-листы на сегодня:</b>\n"]
    for c in checklists:
        done = "✅" if c.completed_at else "⬜"
        lines.append(f"{done} <b>{c.name}</b> ({c.type})")
        for item in c.items:
            check = "☑️" if item.get("done") else "☐"
            lines.append(f"   {check} {item.get('text', '')}")
    await message.answer("\n".join(lines))


@router.message(Command("remind"))
async def cmd_remind(message: Message, command: CommandObject):
    text = (command.args or "").strip()
    if not text:
        await message.answer("Формат: /remind &lt;текст напоминания&gt;")
        return

    telegram_id = str(message.from_user.id)
    from datetime import datetime as dt, timedelta

    async with async_session() as db:
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            await message.answer("Сначала нажми /start")
            return

        reminder = Reminder(
            title=text,
            remind_at=dt.utcnow() + timedelta(hours=1),
            created_by=user.id,
        )
        db.add(reminder)
        await db.commit()

    await message.answer(f"⏰ Напоминание создано: <b>{text}</b>\nЧерез 1 час.")

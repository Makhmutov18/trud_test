import hashlib
import hmac
import json
import logging
from datetime import datetime, timedelta
from urllib.parse import parse_qs, unquote

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


def verify_telegram_init_data(init_data: str) -> dict | None:
    if not init_data:
        return None

    parsed = parse_qs(init_data, keep_blank_values=True)
    data = {k: v[0] for k, v in parsed.items()}

    received_hash = data.pop("hash", None)
    if not received_hash:
        return None

    sorted_keys = sorted(data.keys())
    data_check_parts = []
    for key in sorted_keys:
        decoded = unquote(data[key])
        data_check_parts.append(f"{key}={decoded}")
    data_check_string = "\n".join(data_check_parts)

    secret_key = hmac.new(
        key=b"WebAppData",
        msg=settings.BOT_TOKEN.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()

    expected_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        return None

    user_str = data.get("user")
    if user_str:
        try:
            data["user"] = json.loads(unquote(user_str))
        except (json.JSONDecodeError, TypeError):
            return None

    return data


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    tg_init_data = request.headers.get("X-TG-Init-Data")

    if tg_init_data:
        tg_data = verify_telegram_init_data(tg_init_data)
        if tg_data is None:
            raise HTTPException(status_code=401, detail="Invalid Telegram auth")
        user_info = tg_data.get("user", {})
        telegram_id = str(user_info.get("id"))
        if not telegram_id:
            raise HTTPException(status_code=401, detail="Cannot extract user ID")

        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                telegram_id=telegram_id,
                name=user_info.get("first_name", ""),
                username=user_info.get("username"),
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user

    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=["HS256"])
            telegram_id = payload.get("sub")
            if telegram_id:
                result = await db.execute(select(User).where(User.telegram_id == telegram_id))
                user = result.scalar_one_or_none()
                if user:
                    return user
        except Exception:
            pass

    raise HTTPException(status_code=401, detail="Not authenticated")

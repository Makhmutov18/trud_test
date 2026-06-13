from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/trud.db"
    BOT_TOKEN: str = ""
    SECRET_KEY: str = "change-me-in-production"
    WEBAPP_URL: str = "http://localhost:3000"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    BOT_POLLING_ENABLED: bool = True

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @field_validator("BOT_POLLING_ENABLED", mode="before")
    @classmethod
    def parse_bool(cls, v):
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("1", "true", "yes", "on")
        return bool(v)


settings = Settings()

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/trud.db"
    BOT_TOKEN: str = ""
    SECRET_KEY: str = "change-me-in-production"
    WEBAPP_URL: str = "http://localhost:3000"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

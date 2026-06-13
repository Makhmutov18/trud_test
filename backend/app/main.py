import asyncio
import logging
import os

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.api import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

_polling_task = None

STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "out"


async def start_polling():
    from app.bot import bot, dp
    if not bot or not dp:
        return
    try:
        logger.info("Starting bot polling...")
        await dp.start_polling(bot)
    except asyncio.CancelledError:
        logger.info("Bot polling cancelled")
    except Exception as e:
        logger.error("Polling error: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _polling_task

    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error("Database init failed (continuing without DB): %s", e)

    try:
        from app.bot import setup_bot
        setup_bot()
        from app.bot import bot
        if bot and settings.BOT_POLLING_ENABLED:
            _polling_task = asyncio.create_task(start_polling())
            logger.info("Bot polling started")
        elif bot and not settings.BOT_POLLING_ENABLED:
            logger.info("Bot polling disabled via BOT_POLLING_ENABLED=False")
    except Exception as e:
        logger.error("Bot setup failed (continuing without bot): %s", e)

    yield

    if _polling_task:
        _polling_task.cancel()
        try:
            await _polling_task
        except asyncio.CancelledError:
            pass
    logger.info("Shutdown complete")


app = FastAPI(
    title="ТРУД API",
    description="Internal management app for ТРУД coffee bar",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


# Serve compiled frontend static files (Next.js output: export)
if STATIC_DIR.is_dir():
    app.mount("/_next", StaticFiles(directory=str(STATIC_DIR / "_next")), name="next-assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(str(STATIC_DIR / "index.html"))

    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        file_path = STATIC_DIR / path
        if file_path.is_file():
            return FileResponse(str(file_path))

        html_path = STATIC_DIR / f"{path}/index.html"
        if html_path.is_file():
            return FileResponse(str(html_path))

        index = STATIC_DIR / "index.html"
        if index.exists():
            return FileResponse(str(index))

        return Response(status_code=404)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

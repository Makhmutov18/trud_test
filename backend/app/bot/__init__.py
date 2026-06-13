import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from app.config import settings
from app.bot.handlers import router as handlers_router

logger = logging.getLogger(__name__)

bot = None
dp = None


def setup_bot():
    global bot, dp
    if not settings.BOT_TOKEN:
        logger.warning("BOT_TOKEN not set, bot disabled")
        return

    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.include_router(handlers_router)
    logger.info("Bot configured")

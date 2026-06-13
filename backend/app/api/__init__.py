from fastapi import APIRouter

from app.api.coffee import router as coffee_router
from app.api.operations import router as operations_router
from app.api.bakery import router as bakery_router
from app.api.dashboard import router as dashboard_router

api_router = APIRouter()
api_router.include_router(coffee_router)
api_router.include_router(operations_router)
api_router.include_router(bakery_router)
api_router.include_router(dashboard_router)

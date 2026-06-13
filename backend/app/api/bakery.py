from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.bakery import BakeryItem
from app.schemas.bakery import BakeryItemCreate, BakeryItemUpdate, BakeryItemOut

router = APIRouter(prefix="/api/bakery", tags=["bakery"])


@router.get("/items", response_model=list[BakeryItemOut])
async def list_bakery_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BakeryItem).where(BakeryItem.is_available == True))
    return result.scalars().all()


@router.post("/items", response_model=BakeryItemOut, status_code=201)
async def create_bakery_item(data: BakeryItemCreate, db: AsyncSession = Depends(get_db)):
    item = BakeryItem(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/items/{item_id}", response_model=BakeryItemOut)
async def get_bakery_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BakeryItem).where(BakeryItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Bakery item not found")
    return item


@router.put("/items/{item_id}", response_model=BakeryItemOut)
async def update_bakery_item(
    item_id: int, data: BakeryItemUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BakeryItem).where(BakeryItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Bakery item not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/items/{item_id}")
async def delete_bakery_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BakeryItem).where(BakeryItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Bakery item not found")
    item.is_available = False
    await db.commit()
    return {"message": "Deleted"}

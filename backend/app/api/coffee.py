from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.coffee import Lot, Recipe, Tea, BrewLog, BrewStatus
from app.schemas.coffee import (
    LotCreate, LotOut,
    RecipeCreate, RecipeUpdate, RecipeOut,
    TeaCreate, TeaOut,
    BrewLogCreate, BrewLogOut,
)

router = APIRouter(prefix="/api/coffee", tags=["coffee"])


def calculate_extraction(beverage_weight: float, tds_percent: float, dose: float) -> float:
    if dose <= 0:
        raise ValueError("dose must be > 0")
    return round((beverage_weight * tds_percent) / dose, 2)


# ── Lots ──


@router.get("/lots", response_model=list[LotOut])
async def list_lots(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lot).order_by(Lot.created_at.desc()))
    return result.scalars().all()


@router.post("/lots", response_model=LotOut, status_code=201)
async def create_lot(data: LotCreate, db: AsyncSession = Depends(get_db)):
    lot = Lot(**data.model_dump())
    db.add(lot)
    await db.commit()
    await db.refresh(lot)
    return lot


@router.put("/lots/{lot_id}", response_model=LotOut)
async def update_lot(lot_id: int, data: LotCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lot).where(Lot.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(lot, k, v)
    await db.commit()
    await db.refresh(lot)
    return lot


@router.delete("/lots/{lot_id}")
async def delete_lot(lot_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lot).where(Lot.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    await db.delete(lot)
    await db.commit()
    return {"message": "Deleted"}


# ── Recipes ──


@router.get("/recipes", response_model=list[RecipeOut])
async def list_recipes(
    type: str | None = None,
    lot_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Recipe).where(Recipe.is_active == True)
    if type:
        query = query.where(Recipe.type == type)
    if lot_id:
        query = query.where(Recipe.lot_id == lot_id)
    query = query.order_by(Recipe.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/recipes", response_model=RecipeOut, status_code=201)
async def create_recipe(data: RecipeCreate, db: AsyncSession = Depends(get_db)):
    recipe = Recipe(**data.model_dump())
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)
    return recipe


@router.get("/recipes/{recipe_id}", response_model=RecipeOut)
async def get_recipe(recipe_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.put("/recipes/{recipe_id}", response_model=RecipeOut)
async def update_recipe(recipe_id: int, data: RecipeUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(recipe, k, v)
    recipe.version += 1
    await db.commit()
    await db.refresh(recipe)
    return recipe


@router.delete("/recipes/{recipe_id}")
async def delete_recipe(recipe_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    recipe.is_active = False
    await db.commit()
    return {"message": "Deleted"}


# ── Tea ──


@router.get("/tea", response_model=list[TeaOut])
async def list_tea(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tea).where(Tea.is_available == True))
    return result.scalars().all()


@router.post("/tea", response_model=TeaOut, status_code=201)
async def create_tea(data: TeaCreate, db: AsyncSession = Depends(get_db)):
    tea = Tea(**data.model_dump())
    db.add(tea)
    await db.commit()
    await db.refresh(tea)
    return tea


@router.delete("/tea/{tea_id}")
async def delete_tea(tea_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tea).where(Tea.id == tea_id))
    tea = result.scalar_one_or_none()
    if not tea:
        raise HTTPException(status_code=404, detail="Tea not found")
    tea.is_available = False
    await db.commit()
    return {"message": "Deleted"}


# ── Brew Log ──


@router.get("/brew-log", response_model=list[BrewLogOut])
async def list_brew_logs(
    limit: int = 50,
    user_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(BrewLog)
    if user_id:
        query = query.where(BrewLog.user_id == user_id)
    else:
        query = query.where(BrewLog.user_id == current_user.id)
    query = query.order_by(BrewLog.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/brew-log", response_model=BrewLogOut, status_code=201)
async def create_brew_log(
    data: BrewLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    extraction = data.extraction
    if data.tds and not extraction:
        try:
            extraction = calculate_extraction(data.weight_out, data.tds, data.weight_in)
        except ValueError:
            pass

    status = BrewStatus.within_spec.value
    if extraction is not None and (extraction < 18 or extraction > 22):
        status = BrewStatus.out_of_limits.value

    log = BrewLog(
        **data.model_dump(),
        user_id=current_user.id,
        extraction=extraction,
        status=status,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


@router.post("/calculate")
async def calculate(data: dict):
    try:
        ext = calculate_extraction(
            float(data["beverageWeight"]),
            float(data["tds"]),
            float(data["dose"]),
        )
        return {"extraction": ext, "formula": "(beverageWeight * tds) / dose"}
    except (ValueError, KeyError) as e:
        raise HTTPException(status_code=400, detail=str(e))

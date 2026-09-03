from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
import math

from app.db.database import get_db
from app.db.models import SaraFoodItem
from app.schemas.nutrition import PaginatedFoodResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/nutrition", tags=["Nutrition Catalog"])

@router.get("/foods", response_model=PaginatedFoodResponse)
async def get_sara_foods(
    q: Optional[str] = Query(None, description="Búsqueda por nombre de alimento"),
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(20, ge=1, le=100, description="Tamaño de la página"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # Protección JWT (Solo Lectura B2B)
):
    """
    Recupera el catálogo de alimentos SARA 2 con paginación y filtrado.
    El Endpoint está protegido por el middleware JWT para evitar web scraping no autorizado.
    """
    offset = (page - 1) * limit
    
    # 1. Base Query
    base_query = select(SaraFoodItem)
    count_query = select(func.count()).select_from(SaraFoodItem)
    
    # 2. Búsqueda de Texto
    if q:
        search_filter = SaraFoodItem.name.ilike(f"%{q}%")
        base_query = base_query.where(search_filter)
        count_query = count_query.where(search_filter)
    
    # 3. Paginación y Orden (Alfabético)
    base_query = base_query.order_by(SaraFoodItem.name.asc()).offset(offset).limit(limit)
    
    # 4. Ejecución Concurrente
    total_result = await db.execute(count_query)
    total_items = total_result.scalar() or 0
    
    items_result = await db.execute(base_query)
    items_db = items_result.scalars().all()
    
    # Map DB models to Pydantic response format
    mapped_items = []
    for item in items_db:
        mapped_items.append({
            "id_sara": item.id,
            "alimento": item.name,
            "grupo": item.category,
            "enerc_kcal": item.energy_kcal,
            "protcnt": item.protein_g,
            "fat": item.total_fat_g,
            "choavldf": item.available_carbs_g
        })
    
    # 5. Respuesta
    total_pages = math.ceil(total_items / limit) if total_items > 0 else 0
    
    return {
        "items": mapped_items,
        "total": total_items,
        "page": page,
        "limit": limit,
        "pages": total_pages
    }

from pydantic import BaseModel
from typing import List, Dict

class RadarDataRequest(BaseModel):
    plan_micros: Dict[str, float]
    pathologies: List[str] = []
    allergies: List[str] = []

@router.post("/radar-data")
async def get_radar_data(
    request: RadarDataRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint para proveer los datos de micronutrientes, cruzados con los
    requerimientos de patologías de un paciente.
    """
    # Dynamic values based on the input plan_micros
    micros = request.plan_micros
    
    nutrients = {
        "iron": min(micros.get("iron", 0) / 18.0, 1.2),
        "calcium": min(micros.get("calcium", 0) / 1000.0, 1.2),
        "selenium": min(micros.get("selenium", 0) / 55.0, 1.2),
        "vitamin_d": min(micros.get("vitamin_d", 0) / 15.0, 1.2),
        "magnesium": min(micros.get("magnesium", 0) / 320.0, 1.2),
        "vitamin_b12": min(micros.get("vitamin_b12", 0) / 2.4, 1.2),
        "zinc": min(micros.get("zinc", 0) / 11.0, 1.2),
        "folate": min(micros.get("folate", 0) / 400.0, 1.2)
    }

    # Generate alerts based on deficits
    alerts = []
    if nutrients["iron"] < 1.0 and "anemia" in request.pathologies:
        deficit_percent = (1.0 - nutrients["iron"]) * 100
        alerts.append({
            "severity": "high" if deficit_percent > 30 else "medium",
            "nutrient": "iron",
            "current_value": micros.get("iron", 0),
            "target_value": 18,
            "unit": "mg",
            "deficit_percent": deficit_percent,
            "message": "Déficit de Hierro detectado",
            "suggestion": "Agrega Lentejas o Espinaca a tu plan",
            "suggested_foods": ["Lentejas (3.3 mg/100g)", "Espinaca (2.7 mg/100g)", "Carne Roja (2.6 mg/100g)"],
            "pathology": "anemia"
        })
    
    if nutrients["selenium"] < 1.0 and "hypothyroidism" in request.pathologies:
        deficit_percent = (1.0 - nutrients["selenium"]) * 100
        alerts.append({
            "severity": "high" if deficit_percent > 30 else "medium",
            "nutrient": "selenium",
            "current_value": micros.get("selenium", 0),
            "target_value": 55,
            "unit": "mcg",
            "deficit_percent": deficit_percent,
            "message": "Déficit de Selenio detectado",
            "suggestion": "Agrega Nueces de Brasil a tu plan",
            "suggested_foods": ["Nueces de Brasil (1917 mcg/100g)", "Atún (90 mcg/100g)"],
            "pathology": "hypothyroidism"
        })
        
    overall_score = sum(nutrients.values()) / len(nutrients) if nutrients else 0

    return {
        "nutrients": nutrients,
        "alerts": alerts,
        "overall_score": overall_score
    }


from app.db.models import NutritionPlan, Recipe

class RecipeCreate(BaseModel):
    title: str
    ingredients: list
    macros: dict
    instructions: str = None
    tags: list = []

@router.get("/plans")
async def get_nutrition_plans(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = select(NutritionPlan).where(NutritionPlan.tenant_id == current_user.tenant_id)
    result = await db.execute(query)
    plans = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "title": p.title,
            "client_id": p.client_id,
            "daily_macros_target": p.daily_macros_target
        } for p in plans
    ]

@router.post("/recipes")
async def create_recipe(
    recipe: RecipeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    new_recipe = Recipe(
        tenant_id=current_user.tenant_id,
        professional_id=current_user.id,
        title=recipe.title,
        ingredients=recipe.ingredients,
        macros=recipe.macros,
        instructions=recipe.instructions,
        tags=recipe.tags
    )
    db.add(new_recipe)
    await db.commit()
    await db.refresh(new_recipe)
    
    return {
        "id": new_recipe.id,
        "title": new_recipe.title,
        "ingredients": new_recipe.ingredients,
        "macros": new_recipe.macros
    }

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from uuid import UUID
import uuid
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import UserRole
from app.schemas.nutrition_plan import NutritionPlanCreate, NutritionPlanUpdate, NutritionPlanResponse
from app.schemas.nutrition import (
    ShoppingListResponse, 
    MealLogCreate, 
    MealLogResponse, 
    DailyAdherenceResponse
)
from app.middleware.auth import get_current_user, TokenData
from app.repositories.nutrition_repo import NutritionRepository
from app.services.shopping_list_service import ShoppingListService

router = APIRouter()

# -----------------------------------------------------------------------------
# 1. PLANES NUTRICIONALES (CRUD & Active Plan)
# -----------------------------------------------------------------------------
@router.post("/plans", response_model=NutritionPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_nutrition_plan(
    plan: NutritionPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crea un nuevo plan nutricional para un atleta asignado."""
    if current_user.role == UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Los atletas no pueden prescribir planes nutricionales."
        )

    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    user_id = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
    
    repo = NutritionRepository(db, tenant_id)
    new_plan = await repo.create_plan(user_id, plan)

    return {
        "id": new_plan.id,
        "tenant_id": new_plan.tenant_id,
        "athlete_id": str(new_plan.client_id),
        "trainer_id": str(new_plan.professional_id),
        "title": new_plan.title,
        "daily_macros_target": new_plan.daily_macros_target,
        "meals": new_plan.meals,
        "created_at": new_plan.created_at,
        "updated_at": new_plan.updated_at
    }

@router.get("/plans", response_model=List[NutritionPlanResponse])
async def list_nutrition_plans(
    athlete_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Lista los planes nutricionales accesibles para el usuario autenticado."""
    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    user_id = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
    
    repo = NutritionRepository(db, tenant_id)
    
    if current_user.role == UserRole.CLIENT:
        plans = await repo.list_plans(client_id=user_id)
    else:
        client_uuid = UUID(athlete_id) if athlete_id else None
        plans = await repo.list_plans(client_id=client_uuid)

    return [
        {
            "id": p.id,
            "tenant_id": p.tenant_id,
            "athlete_id": str(p.client_id),
            "trainer_id": str(p.professional_id),
            "title": p.title,
            "daily_macros_target": p.daily_macros_target,
            "meals": p.meals,
            "created_at": p.created_at,
            "updated_at": p.updated_at
        }
        for p in plans
    ]

@router.get("/plans/active", response_model=Optional[NutritionPlanResponse])
async def get_active_nutrition_plan(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtiene el plan nutricional activo del atleta autenticado."""
    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    user_id = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
    
    repo = NutritionRepository(db, tenant_id)
    plan = await repo.get_active_plan_for_client(user_id)

    if not plan:
        return None

    return {
        "id": plan.id,
        "tenant_id": plan.tenant_id,
        "athlete_id": str(plan.client_id),
        "trainer_id": str(plan.professional_id),
        "title": plan.title,
        "daily_macros_target": plan.daily_macros_target,
        "meals": plan.meals,
        "created_at": plan.created_at,
        "updated_at": plan.updated_at
    }

@router.get("/plans/{plan_id}", response_model=NutritionPlanResponse)
async def get_nutrition_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtiene el detalle de un plan nutricional específico."""
    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    repo = NutritionRepository(db, tenant_id)
    plan = await repo.get_plan_by_id(UUID(plan_id))

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan nutricional no encontrado."
        )

    return {
        "id": plan.id,
        "tenant_id": plan.tenant_id,
        "athlete_id": str(plan.client_id),
        "trainer_id": str(plan.professional_id),
        "title": plan.title,
        "daily_macros_target": plan.daily_macros_target,
        "meals": plan.meals,
        "created_at": plan.created_at,
        "updated_at": plan.updated_at
    }

@router.put("/plans/{plan_id}", response_model=NutritionPlanResponse)
async def update_nutrition_plan(
    plan_id: str,
    plan_data: NutritionPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualiza un plan nutricional existente."""
    if current_user.role == UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Los atletas no pueden modificar prescripciones nutricionales."
        )

    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    repo = NutritionRepository(db, tenant_id)
    updated = await repo.update_plan(UUID(plan_id), plan_data)

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan no encontrado para actualizar."
        )

    return {
        "id": updated.id,
        "tenant_id": updated.tenant_id,
        "athlete_id": str(updated.client_id),
        "trainer_id": str(updated.professional_id),
        "title": updated.title,
        "daily_macros_target": updated.daily_macros_target,
        "meals": updated.meals,
        "created_at": updated.created_at,
        "updated_at": updated.updated_at
    }

@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_nutrition_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Elimina un plan nutricional."""
    if current_user.role == UserRole.CLIENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso denegado.")

    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    repo = NutritionRepository(db, tenant_id)
    deleted = await repo.delete_plan(UUID(plan_id))

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan no encontrado.")


# -----------------------------------------------------------------------------
# 2. MÓDULO DE COMPRAS (Shopping List Orchestrator)
# -----------------------------------------------------------------------------
@router.post("/shopping-list", response_model=ShoppingListResponse)
async def generate_shopping_list(
    time_horizon: str = Query("1w", pattern="^(3d|1w|2w|1m)$"),
    plan_id: Optional[str] = None,
    custom_meals: Optional[List[Dict[str, Any]]] = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Genera y consolida automáticamente la lista de compras del atleta agrupada por góndolas,
    empaque comercial argentino y medidas caseras según el horizonte temporal (3d, 1w, 2w, 1m).
    """
    meals_to_process = []

    if custom_meals:
        meals_to_process = custom_meals
    elif plan_id:
        tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
        repo = NutritionRepository(db, tenant_id)
        plan = await repo.get_plan_by_id(UUID(plan_id))
        if plan and plan.meals:
            meals_to_process = plan.meals
    else:
        # Fallback: Usar el plan activo del atleta
        tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
        user_id = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
        repo = NutritionRepository(db, tenant_id)
        plan = await repo.get_active_plan_for_client(user_id)
        if plan and plan.meals:
            meals_to_process = plan.meals

    response = ShoppingListService.generate_from_plan(meals_to_process, time_horizon=time_horizon)
    return response


# -----------------------------------------------------------------------------
# 3. MEAL LOGS & ADHERENCIA DIARIA (Diario Nutricional)
# -----------------------------------------------------------------------------
@router.post("/meal-logs", response_model=MealLogResponse, status_code=status.HTTP_201_CREATED)
async def create_meal_log(
    log_in: MealLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Registra una ingesta o comida en el diario nutricional del atleta."""
    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    user_id = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
    
    repo = NutritionRepository(db, tenant_id)
    log = await repo.create_meal_log(
        client_id=user_id,
        raw_text=log_in.raw_text,
        estimated_calories=log_in.estimated_calories,
        estimated_protein=log_in.estimated_protein,
        estimated_carbs=log_in.estimated_carbs,
        estimated_fat=log_in.estimated_fat,
        parsed_items=log_in.parsed_items
    )
    return log

@router.get("/meal-logs", response_model=List[MealLogResponse])
async def list_meal_logs(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Lista las comidas registradas por el atleta."""
    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    user_id = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
    
    repo = NutritionRepository(db, tenant_id)
    logs = await repo.list_meal_logs_for_client(user_id, skip=skip, limit=limit)
    return logs

@router.get("/adherence/today", response_model=DailyAdherenceResponse)
async def get_today_adherence(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Calcula el progreso calórico y de macronutrientes consumidos vs objetivo para el día de hoy."""
    tenant_id = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
    user_id = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
    
    repo = NutritionRepository(db, tenant_id)
    active_plan = await repo.get_active_plan_for_client(user_id)
    logs = await repo.list_meal_logs_for_client(user_id, limit=20)

    # Filtrar logs de hoy
    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    today_logs = [l for l in logs if l.created_at and l.created_at.strftime("%Y-%m-%d") == today_str]

    calories_consumed = sum(l.estimated_calories or 0 for l in today_logs)
    protein_consumed = sum(l.estimated_protein or 0 for l in today_logs)
    carbs_consumed = sum(l.estimated_carbs or 0 for l in today_logs)
    fat_consumed = sum(l.estimated_fat or 0 for l in today_logs)

    # Targets desde el plan activo (o valores estándar)
    targets = (active_plan.daily_macros_target if active_plan and active_plan.daily_macros_target else {})
    calories_target = float(targets.get("calories") or 2000)
    protein_target = float(targets.get("protein") or targets.get("protein_g") or 140)
    carbs_target = float(targets.get("carbs") or targets.get("carbs_g") or 200)
    fat_target = float(targets.get("fats") or targets.get("fat_g") or 60)

    compliance = min(100.0, round((calories_consumed / calories_target * 100), 1)) if calories_target > 0 else 0.0

    return DailyAdherenceResponse(
        date=today_str,
        calories_consumed=round(calories_consumed, 1),
        calories_target=round(calories_target, 1),
        protein_consumed=round(protein_consumed, 1),
        protein_target=round(protein_target, 1),
        carbs_consumed=round(carbs_consumed, 1),
        carbs_target=round(carbs_target, 1),
        fat_consumed=round(fat_consumed, 1),
        fat_target=round(fat_target, 1),
        compliance_percentage=compliance,
        logged_meals_count=len(today_logs)
    )

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
import uuid

from app.db.connection import get_db
from app.middleware.auth import get_current_user, TokenData
from app.db.models import NutritionPlan

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_nutrition_plans(
    client_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtiene los planes nutricionales, opcionalmente filtrados por cliente.
    """
    try:
        tenant_uuid = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
        
        stmt = select(NutritionPlan).where(
            NutritionPlan.tenant_id == tenant_uuid
        )
        
        if client_id:
            stmt = stmt.where(NutritionPlan.client_id == UUID(client_id))
            
        stmt = stmt.offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        plans = result.scalars().all()
        
        return [
            {
                "id": str(p.id),
                "client_id": str(p.client_id),
                "professional_id": str(p.professional_id),
                "title": p.title,
                "daily_macros_target": p.daily_macros_target,
                "meals": p.meals,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "updated_at": p.updated_at.isoformat() if p.updated_at else None
            }
            for p in plans
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/", response_model=dict)
async def create_nutrition_plan(
    plan_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crea o actualiza un plan nutricional para un cliente.
    """
    try:
        tenant_uuid = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
        user_uuid = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
        
        # Validar payload básico
        if "client_id" not in plan_in:
            raise HTTPException(status_code=400, detail="client_id is required")
            
        new_plan = NutritionPlan(
            id=uuid.uuid4(),
            tenant_id=tenant_uuid,
            professional_id=user_uuid,
            client_id=UUID(str(plan_in["client_id"])),
            title=plan_in.get("title", "Plan Nutricional"),
            daily_macros_target=plan_in.get("daily_macros_target", {}),
            meals=plan_in.get("meals", [])
        )
        
        db.add(new_plan)
        await db.commit()
        await db.refresh(new_plan)
        
        return {
            "id": str(new_plan.id),
            "client_id": str(new_plan.client_id),
            "title": new_plan.title,
            "daily_macros_target": new_plan.daily_macros_target,
            "meals": new_plan.meals,
            "created_at": new_plan.created_at.isoformat() if new_plan.created_at else None,
            "updated_at": new_plan.updated_at.isoformat() if new_plan.updated_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

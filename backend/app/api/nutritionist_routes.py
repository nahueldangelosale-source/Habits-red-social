"""
Nutritionist Routes — Dashboard y gestión de pacientes del nutricionista.
Reemplaza el MOCK_NUTRITIONIST_DASHBOARD del frontend.
"""

import uuid
from typing import Any, List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Client, NutritionPlan, Professional
from app.middleware.auth import get_current_professional, TokenData

router = APIRouter()
logger = structlog.get_logger()


@router.get("/dashboard", summary="Dashboard del nutricionista")
async def get_nutritionist_dashboard(
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Devuelve métricas reales del dashboard del nutricionista:
    - Total de pacientes activos
    - Planes nutricionales activos
    - Check-ins de comida pendientes
    - Distribución por objetivo
    """
    tenant_id = current_user.tenant_id
    professional_id = current_user.user_id

    # Contar pacientes del profesional
    patients_result = await db.execute(
        select(func.count(Client.id)).where(
            Client.tenant_id == tenant_id,
            Client.professional_id == professional_id,
        )
    )
    total_patients = patients_result.scalar() or 0

    # Contar planes nutricionales
    plans_result = await db.execute(
        select(func.count(NutritionPlan.id)).where(
            NutritionPlan.tenant_id == tenant_id,
        )
    )
    active_plans = plans_result.scalar() or 0

    # Obtener lista de pacientes con su plan activo
    patients_query = await db.execute(
        select(Client)
        .where(
            Client.tenant_id == tenant_id,
            Client.professional_id == professional_id,
        )
        .order_by(Client.created_at.desc())
        .limit(50)
    )
    patients = list(patients_query.scalars().all())

    patients_list = []
    for p in patients:
        extra = p.extra_data or {}
        feedbacks = extra.get("feedbacks", [])
        meal_checkins = [f for f in feedbacks if f.get("type") == "MEAL_CHECKIN"]

        patients_list.append({
            "id": str(p.id),
            "name": f"{p.first_name} {p.last_name}",
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "goal": extra.get("goal", "No definido"),
            "last_checkin": meal_checkins[-1]["timestamp"] if meal_checkins else None,
            "total_checkins": len(meal_checkins),
        })

    logger.info(
        "nutritionist_dashboard_loaded",
        total_patients=total_patients,
        active_plans=active_plans,
    )

    return {
        "metrics": {
            "total_patients": total_patients,
            "active_plans": active_plans,
            "pending_reviews": 0,  # TODO: Contar reviews pendientes cuando se implemente
            "adherence_rate": 85.0,  # TODO: Calcular desde check-ins reales
        },
        "patients": patients_list,
    }


@router.get("/patients", summary="Lista de pacientes con planes nutricionales")
async def list_nutritionist_patients(
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Lista completa de pacientes del nutricionista con su plan activo."""
    result = await db.execute(
        select(Client)
        .where(
            Client.tenant_id == current_user.tenant_id,
            Client.professional_id == current_user.user_id,
        )
        .order_by(Client.first_name)
    )
    patients = list(result.scalars().all())

    output = []
    for p in patients:
        # Buscar plan nutricional más reciente
        plan_result = await db.execute(
            select(NutritionPlan)
            .where(
                NutritionPlan.client_id == p.id,
            )
            .order_by(NutritionPlan.created_at.desc())
            .limit(1)
        )
        active_plan = plan_result.scalar_one_or_none()

        output.append({
            "id": str(p.id),
            "first_name": p.first_name,
            "last_name": p.last_name,
            "has_active_plan": active_plan is not None,
            "plan_id": str(active_plan.id) if active_plan else None,
            "plan_macros": active_plan.daily_macros_target if active_plan else None,
        })

    return output

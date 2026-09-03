from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from typing import Any

from app.db.database import get_db
from app.db.models import Client, VideoReview, NutritionPlan
from app.middleware.auth import get_current_user, TokenData

router = APIRouter()

@router.get("/dashboard")
async def get_trainer_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get trainer dashboard data, including the triage video queue.
    """
    professional_id = current_user.user_id
    tenant_id = current_user.tenant_id
    
    # Query pending video reviews for this professional
    # Filter out approved/rejected reviews (status != "pending")
    result = await db.execute(
        select(VideoReview)
        .where(
            VideoReview.professional_id == professional_id,
            VideoReview.status == "pending"
        )
    )
    reviews = result.scalars().all()
    
    # Sort them: P1 first, then P2, then P3
    priority_order = {"P1": 1, "P2": 2, "P3": 3}
    sorted_reviews = sorted(reviews, key=lambda r: priority_order.get(r.ai_priority, 99))
    
    video_queue = []
    for r in sorted_reviews:
        # Fetch client name
        client_res = await db.execute(
            select(Client).where(Client.id == r.client_id)
        )
        client = client_res.scalar_one_or_none()
        client_name = f"{client.first_name} {client.last_name}" if client else "Unknown Client"
        
        video_queue.append({
            "id": str(r.id),
            "client_id": str(r.client_id),
            "client_name": client_name,
            "exercise": r.exercise_name,
            "video_url": r.video_url,
            "thumbnail_url": r.thumbnail_url or "",
            "uploaded_at": str(r.id), 
            "duration": "0:45",
            "ai_priority": r.ai_priority,
            "ai_triage_category": r.ai_triage_category
        })
        
    return {
        "video_queue": video_queue
    }

@router.get("/athletes/{athlete_id}")
async def get_athlete_detail(
    athlete_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get full details for a specific athlete.
    """
    tenant_id = current_user.tenant_id
    
    result = await db.execute(
        select(Client)
        .where(
            Client.id == athlete_id,
            Client.tenant_id == tenant_id
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )
    
    extra = client.extra_data or {}
    
    # Extract acwr_data or default
    acwr_data = extra.get("acwr_data", {
        "acute_load": 12.0,
        "chronic_load": 12.0,
        "acwr": 1.0,
        "risk_status": "SWEET_SPOT",
        "risk_color": "emerald"
    })
    
    # Extract performance_stats or default
    performance_stats = extra.get("performance_stats", {
        "Squat_1rm": 120,
        "Bench Press_1rm": 95,
        "Deadlift_1rm": 160,
        "Total Volume": 12400
    })
    
    # Extract sessions or default
    sessions = extra.get("sessions", [
        {"date": "2026-06-15", "volume": 2800, "rpe": 8},
        {"date": "2026-06-17", "volume": 3100, "rpe": 7},
        {"date": "2026-06-19", "volume": 3250, "rpe": 9},
        {"date": "2026-06-21", "volume": 3250, "rpe": 8}
    ])
    
    videos = extra.get("videos", [])

    # Fetch active nutrition plan
    nutrition_res = await db.execute(
        select(NutritionPlan)
        .where(NutritionPlan.client_id == athlete_id)
        .order_by(NutritionPlan.created_at.desc())
        .limit(1)
    )
    active_nutrition = nutrition_res.scalar_one_or_none()
    
    nutrition_data = None
    if active_nutrition:
        nutrition_data = {
            "id": str(active_nutrition.id),
            "macros": active_nutrition.daily_macros_target if hasattr(active_nutrition, 'daily_macros_target') else {},
            "recipes": []
        }
        
    
    return {
        "id": str(client.id),
        "first_name": client.first_name,
        "last_name": client.last_name,
        "photo_url": extra.get("photo_url"),
        "onboarding_data": {
            "biometrics": extra.get("biometrics", {}),
            "ai_reasoning": extra.get("ai_reasoning", {
                "summary": extra.get("notes") or f"Atleta enfocado en objetivos deportivos. Nivel de estrés: {extra.get('habit_stress_level', 5)}/10."
            }),
            "notes": extra.get("notes"),
            "medical_tags": extra.get("medical_tags", []),
            "goal_tags": extra.get("goal_tags", []),
            "habit_stress_level": extra.get("habit_stress_level", 5),
            "habit_sleep_quality": extra.get("habit_sleep_quality", 4),
            "habit_work_type": extra.get("habit_work_type", "SEDENTARY")
        },
        "injuries": [],
        "active_program_name": extra.get("active_program_name") or "Plan de Acondicionamiento G7",
        "performance_stats": performance_stats,
        "sessions": sessions,
        "videos": videos,
        "acwr_data": acwr_data,
        "nutrition": nutrition_data
    }


@router.post("/video-review/{video_id}/approve")
async def approve_video_review(
    video_id: uuid.UUID,
    body: dict = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """Aprueba un video de técnica. Actualiza el estado en PostgreSQL."""
    result = await db.execute(
        select(VideoReview).where(
            VideoReview.id == video_id,
            VideoReview.professional_id == current_user.user_id,
        )
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Video review not found")

    review.status = "approved"
    review.feedback = (body or {}).get("feedback", "")
    await db.commit()
    return {"success": True, "id": str(video_id), "status": "approved"}


@router.post("/video-review/{video_id}/reject")
async def reject_video_review(
    video_id: uuid.UUID,
    body: dict = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """Rechaza un video de técnica y solicita re-grabación."""
    result = await db.execute(
        select(VideoReview).where(
            VideoReview.id == video_id,
            VideoReview.professional_id == current_user.user_id,
        )
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Video review not found")

    review.status = "rejected"
    review.feedback = (body or {}).get("reason", "Re-grabación solicitada")
    await db.commit()
    return {"success": True, "id": str(video_id), "status": "rejected"}


@router.post("/resolve-delinquency/{client_id}")
async def resolve_delinquency(
    client_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """Quita la marca de morosidad de un cliente (Zero-Trust FinOps)."""
    result = await db.execute(
        select(Client).where(
            Client.id == client_id,
            Client.tenant_id == current_user.tenant_id,
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    extra = client.extra_data or {}
    extra["payment_status"] = "current"
    extra["delinquency_resolved_at"] = str(uuid.uuid4())[:8]
    client.extra_data = extra
    await db.commit()
    return {"success": True, "client_id": str(client_id), "status": "resolved"}

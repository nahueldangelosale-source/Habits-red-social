"""
Validations Router — Cola y validación de técnicas de video para entrenadores.
Conecta con PostgreSQL (tabla video_reviews) y asigna feedback al atleta.

Formato de respuesta compatible con useValidations.ts del frontend:
  GET /pending → {cursor: string|null, validations: ValidationItem[]}
  POST /{id}/decide → alias de POST /{id}/review
"""

import uuid
from typing import Any, List, Optional
from datetime import datetime

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import VideoReview, Client
from app.middleware.auth import get_current_user, TokenData

router = APIRouter()
logger = structlog.get_logger()


# =============================================================================
# SCHEMAS (compatibles con useValidations.ts ValidationItem)
# =============================================================================

class ValidationReviewPayload(BaseModel):
    """Payload del coach al decidir sobre un video."""
    decision: Optional[str] = Field(None, description="'approved', 'adjusted', o 'rejected'")
    status: Optional[str] = Field(None, description="Alias de decision para compat frontend")
    feedback: Optional[str] = Field(None, description="Comentarios técnicos del coach")
    coaching_comment: Optional[str] = Field(None, description="Alias de feedback para compat frontend")
    feedback_tags: Optional[List[str]] = Field(default_factory=list)
    load_delta_kg: Optional[float] = 0.0

    model_config = ConfigDict(extra="ignore")


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/pending", summary="Obtener videos de técnica pendientes de validación")
async def get_pending_validations(
    cursor: Optional[str] = Query(None),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Retorna la lista de videos de técnica pendientes de revisión.
    Formato compatible con useValidations.ts: {cursor, validations[]}.
    """
    result = await db.execute(
        select(VideoReview, Client.first_name, Client.last_name, Client.extra_data)
        .join(Client, VideoReview.client_id == Client.id)
        .where(
            VideoReview.professional_id == current_user.user_id,
            VideoReview.status == "pending"
        )
        .order_by(VideoReview.ai_priority.asc())
        .limit(20)
    )

    rows = result.all()
    validations = []

    for review, first_name, last_name, extra_data in rows:
        validations.append({
            "id": str(review.id),
            "type": "B2C_BIOMECHANICS" if review.video_url else "B2B_AI_ADJUSTMENT",
            "athlete_name": f"{first_name} {last_name}",
            "exercise_name": review.exercise_name,
            "video_url": review.video_url or "",
            "metrics_target": {
                "ai_priority": review.ai_priority or "P2",
                "ai_triage_category": review.ai_triage_category or "Revisión General",
            },
            "submitted_at": datetime.utcnow().isoformat(),
            "metadata": {
                "hls_url": review.video_url or "",
                "thumbnail_url": review.thumbnail_url or "",
                "client_id": str(review.client_id),
            },
        })

    return {
        "cursor": None,
        "validations": validations,
    }


@router.get("/{validation_id}", summary="Obtener detalle de validación")
async def get_validation_detail(
    validation_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retorna los datos completos de una validación de técnica."""
    result = await db.execute(
        select(VideoReview, Client.first_name, Client.last_name)
        .join(Client, VideoReview.client_id == Client.id)
        .where(
            VideoReview.id == validation_id,
            VideoReview.professional_id == current_user.user_id,
        )
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Validación no encontrada")

    review, first_name, last_name = row
    return {
        "id": str(review.id),
        "athlete_id": str(review.client_id),
        "athlete_name": f"{first_name} {last_name}",
        "exercise_name": review.exercise_name,
        "video_url": review.video_url,
        "thumbnail_url": review.thumbnail_url,
        "ai_priority": review.ai_priority,
        "ai_triage_category": review.ai_triage_category,
        "status": review.status,
        "feedback": review.feedback,
    }


async def _process_review(
    validation_id: uuid.UUID,
    payload: ValidationReviewPayload,
    current_user: TokenData,
    db: AsyncSession,
) -> dict:
    """Lógica compartida para /review y /decide."""
    result = await db.execute(
        select(VideoReview).where(
            VideoReview.id == validation_id,
            VideoReview.professional_id == current_user.user_id,
        )
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Validación no encontrada")

    # Resolver campos con alias (frontend usa status/coaching_comment, backend usa decision/feedback)
    final_decision = payload.decision or payload.status or "approved"
    final_feedback = payload.feedback or payload.coaching_comment or ""

    review.status = final_decision
    review.feedback = final_feedback

    await db.commit()
    await db.refresh(review)

    logger.info(
        "validation_reviewed",
        validation_id=str(validation_id),
        decision=final_decision,
        coach_id=str(current_user.user_id),
    )

    return {
        "success": True,
        "id": str(review.id),
        "status": review.status,
        "message": f"Validación procesada como '{review.status}' exitosamente",
        "feedback": review.feedback,
    }


@router.post("/{validation_id}/review", summary="Procesar feedback del coach (ruta canónica)")
async def review_validation(
    validation_id: uuid.UUID,
    payload: ValidationReviewPayload,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Ruta canónica del backend para procesar feedback."""
    return await _process_review(validation_id, payload, current_user, db)


@router.post("/{validation_id}/decide", summary="Procesar feedback del coach (alias frontend)")
async def decide_validation(
    validation_id: uuid.UUID,
    payload: ValidationReviewPayload,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Alias para compatibilidad con useValidations.ts del frontend."""
    return await _process_review(validation_id, payload, current_user, db)

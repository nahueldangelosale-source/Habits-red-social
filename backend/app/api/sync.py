"""
Sync Router — Reconciliación offline para el cliente.
Recibe mutaciones encoladas por IndexedDB y resuelve conflictos
con Idempotency Keys (UUIDv4).
"""

import uuid
from datetime import datetime
from typing import Any, List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData

router = APIRouter()
logger = structlog.get_logger()


class SyncMutation(BaseModel):
    """Una mutación individual generada offline por el cliente."""
    idempotency_key: str = Field(description="UUID v4 generado por el cliente")
    entity_type: str = Field(description="Tipo de entidad: 'SET', 'FEEDBACK', 'CHECKIN'")
    action: str = Field(description="Acción: 'CREATE', 'UPDATE', 'DELETE'")
    payload: dict = Field(default_factory=dict)
    client_timestamp: datetime

    model_config = ConfigDict(strict=True)


class SyncPushRequest(BaseModel):
    """Batch de mutaciones offline a sincronizar."""
    mutations: List[SyncMutation] = Field(default_factory=list)

    model_config = ConfigDict(strict=True)


class SyncResult(BaseModel):
    """Resultado de sincronización por mutación."""
    idempotency_key: str
    status: str  # 'applied', 'already_applied', 'conflict', 'error'
    message: Optional[str] = None


@router.post("/push", summary="Sincronizar mutaciones offline")
async def sync_push(
    request: SyncPushRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Recibe un batch de mutaciones generadas offline por el cliente.
    Procesa cada una con idempotency check para evitar duplicados.
    Compatible con el offline sync queue de IndexedDB (offlineDb.ts).
    """
    results: List[dict] = []

    for mutation in request.mutations:
        try:
            if mutation.entity_type == "SET":
                # Import WorkoutSets model
                from app.db.models import WorkoutSets

                # Check idempotency
                existing = await db.execute(
                    select(WorkoutSets).where(
                        WorkoutSets.idempotency_key == mutation.idempotency_key
                    )
                )
                if existing.scalar_one_or_none():
                    results.append({
                        "idempotency_key": mutation.idempotency_key,
                        "status": "already_applied",
                        "message": "Mutación ya procesada previamente",
                    })
                    continue

                # Create the set
                payload = mutation.payload
                new_set = WorkoutSets(
                    athlete_id=current_user.user_id,
                    exercise_id=uuid.UUID(payload["exercise_id"]),
                    idempotency_key=mutation.idempotency_key,
                    target_reps=payload.get("target_reps", 0),
                    target_weight=payload.get("target_weight", 0.0),
                    actual_reps=payload.get("actual_reps"),
                    actual_weight=payload.get("actual_weight"),
                    rpe=payload.get("rpe"),
                    is_completed=payload.get("is_completed", True),
                    client_created_at=mutation.client_timestamp,
                )
                db.add(new_set)
                results.append({
                    "idempotency_key": mutation.idempotency_key,
                    "status": "applied",
                })

            elif mutation.entity_type in ("FEEDBACK", "CHECKIN"):
                from app.db.models import Client
                from sqlalchemy.orm.attributes import flag_modified

                client_result = await db.execute(
                    select(Client).where(Client.id == current_user.user_id)
                )
                client = client_result.scalar_one_or_none()
                if client:
                    extra_data = client.extra_data or {}
                    feedbacks = extra_data.get("feedbacks", [])

                    # Check idempotency
                    existing_keys = {f.get("idempotency_key") for f in feedbacks if f.get("idempotency_key")}
                    if mutation.idempotency_key in existing_keys:
                        results.append({
                            "idempotency_key": mutation.idempotency_key,
                            "status": "already_applied",
                        })
                        continue

                    feedbacks.append({
                        "type": mutation.payload.get("type", "GENERAL"),
                        "data": mutation.payload,
                        "timestamp": mutation.client_timestamp.isoformat(),
                        "idempotency_key": mutation.idempotency_key,
                    })
                    extra_data["feedbacks"] = feedbacks[-50:]
                    client.extra_data = extra_data
                    flag_modified(client, "extra_data")

                    results.append({
                        "idempotency_key": mutation.idempotency_key,
                        "status": "applied",
                    })
                else:
                    results.append({
                        "idempotency_key": mutation.idempotency_key,
                        "status": "error",
                        "message": "Atleta no encontrado",
                    })

            else:
                results.append({
                    "idempotency_key": mutation.idempotency_key,
                    "status": "error",
                    "message": f"Tipo de entidad no soportado: {mutation.entity_type}",
                })

        except Exception as e:
            logger.error(
                "sync_mutation_failed",
                idempotency_key=mutation.idempotency_key,
                error=str(e),
            )
            results.append({
                "idempotency_key": mutation.idempotency_key,
                "status": "error",
                "message": str(e),
            })

    await db.commit()

    applied = sum(1 for r in results if r["status"] == "applied")
    skipped = sum(1 for r in results if r["status"] == "already_applied")

    logger.info(
        "sync_push_completed",
        total=len(results),
        applied=applied,
        skipped=skipped,
        user_id=str(current_user.user_id),
    )

    return {
        "total": len(results),
        "applied": applied,
        "already_applied": skipped,
        "errors": sum(1 for r in results if r["status"] == "error"),
        "results": results,
    }


@router.get("/pull", summary="Obtener cambios desde el servidor")
async def sync_pull(
    since: Optional[datetime] = None,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Devuelve los cambios del servidor desde el timestamp dado.
    El cliente usa esto para actualizar su IndexedDB local.
    """
    from app.db.models import WorkoutSets

    query = select(WorkoutSets).where(
        WorkoutSets.athlete_id == current_user.user_id,
    )

    if since:
        query = query.where(WorkoutSets.client_created_at > since)

    query = query.order_by(WorkoutSets.client_created_at.desc()).limit(100)

    result = await db.execute(query)
    sets = list(result.scalars().all())

    return {
        "server_timestamp": datetime.utcnow().isoformat(),
        "sets": [
            {
                "id": str(s.id),
                "exercise_id": str(s.exercise_id),
                "idempotency_key": s.idempotency_key,
                "target_reps": s.target_reps,
                "actual_reps": s.actual_reps,
                "target_weight": s.target_weight,
                "actual_weight": s.actual_weight,
                "rpe": s.rpe,
                "is_completed": s.is_completed,
                "client_created_at": s.client_created_at.isoformat(),
            }
            for s in sets
        ],
    }

import json
import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.db.models import User, Mesocycle
from app.domain.billing.models import Subscription
from app.schemas.mesocycle import MesocycleCreateSchema, MesocycleResponseSchema

from pydantic import BaseModel

class ProposeMacrocycleRequest(BaseModel):
    athlete_id: str
    tags: list[str]

router = APIRouter(prefix="/api/v1/macrocycles", tags=["Macrocycles (Plan Builder)"])

@router.post("/propose")
async def propose_macrocycle(
    payload: ProposeMacrocycleRequest,
    current_user: TokenData = Depends(get_current_user)
):
    from app.domains.coach.tasks import propose_macrocycle_draft
    # Instanciamos la tarea asincrónica de celery
    task = propose_macrocycle_draft.delay(
        patient_tags=payload.tags,
        coach_id=str(current_user.sub),
        client_id=payload.athlete_id
    )
    return {"task_id": task.id}

from fastapi.responses import StreamingResponse
import asyncio

@router.get("/{task_id}/status")
async def macrocycle_task_status(request: Request, task_id: str):
    from app.services.redis_pubsub import redis_client
    
    async def event_generator():
        # Subscribe to redis channel "task_status:{task_id}"
        pubsub = redis_client.pubsub()
        pubsub.subscribe(f"task_status:{task_id}")
        
        try:
            while True:
                if await request.is_disconnected():
                    break
                
                message = pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    data = message['data'].decode('utf-8') if isinstance(message['data'], bytes) else message['data']
                    yield f"data: {data}\n\n"
                    break # terminate SSE connection once result is pushed
                
                await asyncio.sleep(0.5)
        finally:
            pubsub.unsubscribe(f"task_status:{task_id}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

MAX_ATHLETES_TIER_1 = int(os.environ.get("MAX_ATHLETES_TIER_1", "2"))

async def get_tenant_db(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> AsyncSession:
    """
    Dependency: Inyecta el tenant_id en el contexto local de Postgres (RLS Zero-Trust).
    Resuelve el problema del Connection Pool Genérico.
    """
    claims = {
        "app_metadata": {
            "tenant_id": str(current_user.tenant_id)
        }
    }
    # SET LOCAL is scoped to the current transaction.
    # It will automatically be cleared upon COMMIT/ROLLBACK, preventing connection poisoning.
    await db.execute(text("SET LOCAL request.jwt.claims = :claims"), {"claims": json.dumps(claims)})
    return db

@router.post("", response_model=MesocycleResponseSchema)
async def create_mesocycle(
    payload: MesocycleCreateSchema,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db)  # Usa db con RLS impersonado
):
    """
    Endpoint transaccional O(1) para el Cascade Builder.
    Recibe payload validado por Pydantic estricto e inserta en la base de datos híbrida (JSONB).
    Respeta el límite financiero de la suscripción B2B.
    """
    tenant_id = current_user.tenant_id
    
    # 1. Validar Límite Financiero (Cerrojo B2B)
    stmt_sub = select(Subscription).where(Subscription.tenant_id == tenant_id)
    result_sub = await db.execute(stmt_sub)
    subscription = result_sub.scalar_one_or_none()
    
    tier = subscription.tier if subscription else "TIER_1"
    
    stmt_count = select(func.count(User.id)).where(
        User.tenant_id == tenant_id,
        User.role == "ATHLETE"
    )
    result_count = await db.execute(stmt_count)
    current_athletes = result_count.scalar_one()
    
    limit = MAX_ATHLETES_TIER_1 if tier == "TIER_1" else 500
    
    if current_athletes >= limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "error_code": "SEATS_EXHAUSTED",
                "message": f"Has alcanzado el límite de {limit} atletas de tu Plan Ignite.",
                "tier_required": "TIER_2"
            }
        )
        
    # 2. Insertar el Mesocycle (El RLS interceptará esto a nivel DB si tenant_id no cuadra)
    # Aquí estamos forzando explícitamente el tenant_id al del JWT como segunda capa de defensa.
    new_mesocycle = Mesocycle(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        client_id=payload.client_id,
        coach_id=current_user.user_id,
        taxonomy_id=payload.taxonomy_id,
        name=payload.name,
        routine_structure=payload.routine_structure.model_dump(),
        nutrition_plan=payload.nutrition_plan,
        telemetry_snapshot=payload.telemetry_snapshot,
    )
    
    # Para ser estrictos con la FK de coach_id, debemos resolver el professional.id real.
    from app.db.models import Professional
    stmt_prof = select(Professional.id).where(Professional.user_id == current_user.user_id)
    res_prof = await db.execute(stmt_prof)
    coach_uuid = res_prof.scalar_one_or_none()
    if not coach_uuid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Professional record not found")
        
    new_mesocycle.coach_id = coach_uuid
    
    db.add(new_mesocycle)
    
    try:
        await db.commit()
    except Exception as e:
        # En una situación RLS, un RLS failure tiraría ProgrammingError / InternalError
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="RLS Policy Violation or DB Error")
        
    await db.refresh(new_mesocycle)
    
    return new_mesocycle

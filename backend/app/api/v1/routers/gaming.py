from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import logging

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.domain.gaming.schemas import GamingEventIngress

from redis.asyncio import Redis
from app.services.redis_client import get_redis

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
async def publish_gaming_event(
    event: GamingEventIngress,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Ingesta de Eventos de Gamificación B2C (Día Cero).
    Validación de payload Pydantic estricta.
    Delega el procesamiento asíncrono al Worker de Celery vía Redis Streams.
    """
    # Validación de Seguridad Zero-Trust:
    if str(current_user.user_id) != str(event.user_id):
        raise HTTPException(status_code=403, detail="No puedes publicar eventos en nombre de otro usuario")
    
    if str(current_user.tenant_id) != str(event.tenant_id):
        raise HTTPException(status_code=403, detail="Cruce de Tenant detectado")

    # Productor Seguro: Empujamos al stream para que actúe como amortiguador
    await redis.xadd(
        'gaming_events', 
        {'payload': event.model_dump_json()}
    )
    
    logger.info(f"Gaming Event recibido: {event.action_type} para user {event.user_id}")
    
    # Mock de respuesta optimista para destrabar al Frontend
    return {
        "status": "accepted",
        "event_id": event.event_id,
        "message": "Evento encolado para procesamiento de experiencia"
    }

from fastapi.responses import StreamingResponse
import asyncio

@router.get("/sse")
async def gaming_sse():
    """
    Mock SSE endpoint for gaming notifications.
    """
    async def event_generator():
        while True:
            await asyncio.sleep(30)
            yield "data: {\"type\": \"ping\"}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

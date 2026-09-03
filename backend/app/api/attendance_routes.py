import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.domain.scheduling.models import Reservation
from app.domain.scheduling.security import create_attendance_token, decode_attendance_token
from app.worker.scheduling_worker import persist_attendance_event

router = APIRouter()

class TokenResponse(BaseModel):
    token: str
    expires_in: int = 30

class CheckInRequest(BaseModel):
    token: str

@router.get("/token", response_model=TokenResponse)
async def get_attendance_token(
    reservation_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Genera un token efímero válido por 30s para que el atleta muestre en Recepción.
    Verifica que la reserva le pertenezca y esté BOOKED.
    """
    result = await db.execute(select(Reservation).where(
        Reservation.id == reservation_id,
        Reservation.user_id == current_user.user_id
    ))
    reservation = result.scalar_one_or_none()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
        
    if reservation.status != "BOOKED":
        raise HTTPException(status_code=400, detail=f"Cannot generate QR for status: {reservation.status}")
        
    token = create_attendance_token(
        user_id=current_user.user_id,
        reservation_id=reservation.id,
        tenant_id=current_user.tenant_id
    )
    
    return TokenResponse(token=token)

@router.post("/check-in", status_code=status.HTTP_202_ACCEPTED)
async def process_check_in(
    request: CheckInRequest,
    current_pro: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Valida el token JWT efímero y actualiza la reserva atómicamente a ATTENDED.
    Protección contra race conditions (Doble Escaneo). Retorna 202 Accepted inmediato.
    """
    # 1. Decodificar validando TTL y Leeway, o aceptar Fallback Manual
    reservation_id = None
    user_id = None
    tenant_id = current_pro.tenant_id
    
    try:
        # Intentamos decodificar como JWT efímero
        token_data = decode_attendance_token(request.token)
        reservation_id = token_data.reservation_id
        user_id = token_data.user_id
    except HTTPException as e:
        # Fallback: Si el recepcionista B2B tecleó el ID manualmente
        if current_pro.role in ["PERSONAL_TRAINER", "ADMIN"]:
            try:
                reservation_id = uuid.UUID(request.token)
            except ValueError:
                raise HTTPException(status_code=400, detail="El token manual debe ser un ID de reserva válido (UUID)")
        else:
            raise e # Solo personal autorizado puede hacer override manual
    
    # 2. Update Atómico (Directiva de CTO para mitigar Race Conditions)
    stmt = (
        update(Reservation)
        .where(
            Reservation.id == reservation_id,
            Reservation.status == "BOOKED"
        )
        .values(status="ATTENDED")
        .returning(Reservation.id, Reservation.user_id)
    )
    
    result = await db.execute(stmt)
    row = result.first()
    
    if not row:
        # Pudo no encontrarse o ya no estaba en BOOKED. 
        res = await db.execute(select(Reservation.status).where(Reservation.id == reservation_id))
        current_status = res.scalar_one_or_none()
        
        if current_status == "ATTENDED":
            raise HTTPException(status_code=409, detail="Doble gasto detectado: El pase ya fue utilizado")
        else:
            raise HTTPException(status_code=404, detail="Reserva no encontrada o no válida para check-in")
            
    updated_id, updated_user_id = row
    
    if not user_id:
        user_id = updated_user_id
        
    await db.commit()
    
    from datetime import datetime
    
    # 3. Offload a Celery para el Motor CRI (Event-Driven)
    timestamp_iso = datetime.utcnow().isoformat()
    persist_attendance_event.delay(str(user_id), str(tenant_id), timestamp_iso)
    
    # 4. Guardrail de Idempotencia Diaria (Anti-Exploit) & Dopamina Loop
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    lock_key = f"attendance:lock:{tenant_id}:{user_id}:{today_str}"
    
    from app.services.redis_client import redis_client
    from app.infrastructure.redis.streams import buffer_streak_event
    
    is_unique_today = await redis_client.set(lock_key, "1", ex=86400, nx=True)
    
    if is_unique_today:
        # Paso A: Mutación en Memoria (Redis In-Memory)
        streak_key = f"athlete_streaks:{tenant_id}"
        new_streak_raw = await redis_client.hincrby(streak_key, str(user_id), 1)
        new_streak = int(new_streak_raw)
        
        # Determinar hitos (is_milestone) - Lógica de negocio encapsulada
        milestones = {7, 14, 21, 30, 50, 100}
        is_milestone = new_streak in milestones
        
        import uuid
        payload = {
            "event_id": f"req-{uuid.uuid4().hex[:8]}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "athlete_id": str(user_id),
            "gym_tenant_id": str(tenant_id),
            "streak_data": {
                "current_streak": new_streak,
                "previous_streak": new_streak - 1,
                "is_milestone": is_milestone,
                "milestone_type": f"{new_streak}_days_fire" if is_milestone else None
            },
            "ui_trigger": {
                "animation": "shattering_glass" if is_milestone else "streak_bump",
                "haptic_feedback": "success_heavy" if is_milestone else "success_light"
            }
        }
        await buffer_streak_event(redis_client, str(user_id), payload)
        
    return {"status": "success", "message": "Check-in exitoso"}

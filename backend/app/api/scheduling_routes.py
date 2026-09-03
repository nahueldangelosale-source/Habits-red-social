from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.domain.scheduling.schemas import ReservationCreate, ReservationResponse
from app.domain.scheduling.service import SchedulingService
from app.worker.scheduling_worker import send_reservation_confirmation, sync_reservation_to_analytics
import uuid

router = APIRouter()

@router.post("/reservations", response_model=ReservationResponse)
async def create_reservation(
    booking_req: ReservationCreate,
    x_idempotency_key: str = Header(..., alias="Idempotency-Key"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Crea una reserva de sesión garantizando idempotencia.
    """
    booking_req.idempotency_key = x_idempotency_key
    
    service = SchedulingService(db)
    user_id = current_user.get("id") if hasattr(current_user, "get") else str(current_user.id) if hasattr(current_user, "id") else str(uuid.uuid4())
    
    reservation = await service.book_session(str(user_id), booking_req)
    
    # Offload side-effects (Event-Driven)
    if reservation.status == "CONFIRMED":
        send_reservation_confirmation.delay(str(reservation.id), str(user_id))
        sync_reservation_to_analytics.delay(str(reservation.id))
        
    return reservation

@router.post("/reservations/{reservation_id}/cancel")
async def cancel_reservation(
    reservation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = SchedulingService(db)
    tenant_id = current_user.get("tenant_id") if hasattr(current_user, "get") else str(current_user.tenant_id)
    
    result = await service.cancel_reservation(reservation_id, str(tenant_id))
    
    if result.get("promoted_reservation_id"):
        from app.worker.scheduling_worker import expire_waitlist_offer
        # 15 minutes window
        expire_waitlist_offer.apply_async((result["promoted_reservation_id"],), countdown=900)

    return {"detail": "Reservation cancelled successfully"}

@router.post("/reservations/{reservation_id}/confirm")
async def confirm_waitlist_offer(
    reservation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = SchedulingService(db)
    tenant_id = current_user.get("tenant_id") if hasattr(current_user, "get") else str(current_user.tenant_id)
    
    await service.confirm_waitlist(reservation_id, str(tenant_id))
    return {"detail": "Reservation confirmed from waitlist"}

from pydantic import BaseModel
class ReassignProfessionalRequest(BaseModel):
    professional_id: str

@router.put("/sessions/{session_id}/professional")
async def reassign_session_professional(
    session_id: str,
    payload: ReassignProfessionalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    from app.domain.scheduling.workflow_manager import ClassSessionWorkflowManager
    
    tenant_id = current_user.get("tenant_id") if hasattr(current_user, "get") else str(current_user.tenant_id)
    manager = ClassSessionWorkflowManager(db)
    
    session = await manager.reassign_professional(session_id, payload.professional_id, str(tenant_id))
    return {"detail": "Professional reassigned successfully", "session_id": str(session.id)}

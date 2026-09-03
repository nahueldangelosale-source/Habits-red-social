from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import StaleDataError
from fastapi import HTTPException
from app.domain.scheduling.models import ClassSession, Reservation
from app.domain.scheduling.schemas import ReservationCreate
import logging

logger = logging.getLogger(__name__)

class SchedulingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def book_session(self, user_id: str, booking_req: ReservationCreate) -> Reservation:
        # Check idempotency first (if already exists, return it or fail)
        query = select(Reservation).where(Reservation.idempotency_key == booking_req.idempotency_key)
        result = await self.db.execute(query)
        existing = result.scalars().first()
        if existing:
            return existing

        query = select(ClassSession).where(ClassSession.id == booking_req.session_id)
        result = await self.db.execute(query)
        session = result.scalars().first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        status = "CONFIRMED"
        if session.current_capacity >= session.max_capacity:
            status = "WAITLISTED"
        else:
            # Increment capacity (Optimistic Locking)
            session.current_capacity += 1

        reservation = Reservation(
            session_id=booking_req.session_id,
            user_id=user_id,
            idempotency_key=booking_req.idempotency_key,
            billing_reference_id=booking_req.billing_reference_id,
            status=status
        )
        self.db.add(reservation)

        try:
            await self.db.commit()
            await self.db.refresh(reservation)
            return reservation
        except StaleDataError:
            await self.db.rollback()
            logger.warning(f"Concurrent booking conflict for session {booking_req.session_id}")
            raise HTTPException(status_code=409, detail="Alguien acaba de tomar el último lugar. Por favor, inténtalo de nuevo.")
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(status_code=409, detail="Idempotency key collision or data error.")
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error booking session: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

    async def cancel_reservation(self, reservation_id: str, tenant_id: str) -> dict:
        # Find reservation
        query = select(Reservation).where(Reservation.id == reservation_id)
        res = await self.db.execute(query)
        reservation = res.scalars().first()

        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        if reservation.status in ["CANCELLED", "EXPIRED"]:
            raise HTTPException(status_code=400, detail="Reservation is already cancelled/expired")

        # Verify tenant via session
        query_session = select(ClassSession).where(ClassSession.id == reservation.session_id)
        res_session = await self.db.execute(query_session)
        session = res_session.scalars().first()
        
        if not session or str(session.tenant_id) != tenant_id:
            raise HTTPException(status_code=403, detail="Not authorized for this tenant")

        old_status = reservation.status
        reservation.status = "CANCELLED"
        
        promoted_reservation = None

        if old_status in ["CONFIRMED", "BOOKED"]:
            # Find the first waitlisted
            # using with_for_update(skip_locked=True)
            waitlist_query = select(Reservation).join(ClassSession, Reservation.session_id == ClassSession.id).where(
                Reservation.session_id == reservation.session_id,
                Reservation.status == "WAITLISTED",
                ClassSession.tenant_id == session.tenant_id
            ).order_by(Reservation.created_at.asc()).with_for_update(skip_locked=True).limit(1)
            
            w_res = await self.db.execute(waitlist_query)
            waitlisted = w_res.scalars().first()

            if waitlisted:
                waitlisted.status = "OFFERED"
                promoted_reservation = waitlisted
            else:
                session.current_capacity -= 1
        
        try:
            await self.db.commit()
            if promoted_reservation:
                await self.db.refresh(promoted_reservation)
            return {"status": "cancelled", "promoted_reservation_id": str(promoted_reservation.id) if promoted_reservation else None}
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error cancelling reservation: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

    async def confirm_waitlist(self, reservation_id: str, tenant_id: str):
        query = select(Reservation).where(Reservation.id == reservation_id)
        res = await self.db.execute(query)
        reservation = res.scalars().first()

        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        if reservation.status != "OFFERED":
            raise HTTPException(status_code=400, detail="Reservation is not in OFFERED state")
            
        # Verify tenant
        query_session = select(ClassSession).where(ClassSession.id == reservation.session_id)
        res_session = await self.db.execute(query_session)
        session = res_session.scalars().first()
        if not session or str(session.tenant_id) != tenant_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        reservation.status = "BOOKED"
        await self.db.commit()
        return {"status": "BOOKED"}

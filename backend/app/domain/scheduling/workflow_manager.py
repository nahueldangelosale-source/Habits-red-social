from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.domain.scheduling.models import ClassSession, Reservation
from app.domain.billing.models import Invoice, LedgerEntry
from app.db.models import Tenant
from app.services.redis_client import redis_client
import json
import os

class ClassSessionWorkflowManager:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def reassign_professional(self, session_id: str, new_professional_id: str, tenant_id: str):
        query = select(ClassSession).where(ClassSession.id == session_id)
        res = await self.db.execute(query)
        session = res.scalars().first()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        if str(session.tenant_id) != tenant_id:
            raise HTTPException(status_code=403, detail="Not authorized for this session")

        # Check for overlaps
        overlap_query = select(ClassSession).where(
            ClassSession.professional_id == new_professional_id,
            ClassSession.tenant_id == session.tenant_id,
            ClassSession.id != session_id,
            ClassSession.start_time < session.end_time,
            ClassSession.end_time > session.start_time
        )
        res_overlap = await self.db.execute(overlap_query)
        overlap = res_overlap.scalars().first()

        if overlap:
            # Structurated 409 response
            conflict_details = {
                "error": "Schedule Conflict",
                "message": "The professional is already assigned to another class in this time slot.",
                "conflict_session": {
                    "session_id": str(overlap.id),
                    "name": overlap.name,
                    "start_time": overlap.start_time.isoformat(),
                    "end_time": overlap.end_time.isoformat()
                }
            }
            raise HTTPException(status_code=409, detail=conflict_details)

        # Update professional
        session.professional_id = new_professional_id
        await self.db.commit()
        await self.db.refresh(session)
        
        return session

    async def confirm_paid_reservation(self, reservation_id, invoice_id, amount_cents: int) -> bool:
        try:
            # 1. Fetch Reservation with FOR UPDATE SKIP LOCKED
            stmt_res = select(Reservation).where(
                Reservation.id == reservation_id,
                Reservation.status == "OFFERED"
            ).with_for_update(skip_locked=True)
            res = await self.db.execute(stmt_res)
            reservation = res.scalar_one_or_none()

            if not reservation:
                return False

            # Load Session explicitly to get professional_id
            stmt_session = select(ClassSession).where(ClassSession.id == reservation.session_id)
            res_session = await self.db.execute(stmt_session)
            session = res_session.scalar_one_or_none()

            # 2. Update Reservation Status
            reservation.status = "BOOKED"

            # 3. Update Invoice Status
            stmt_inv = select(Invoice).where(Invoice.id == invoice_id).with_for_update()
            res_inv = await self.db.execute(stmt_inv)
            invoice = res_inv.scalar_one_or_none()
            
            tenant_id = session.tenant_id if session else invoice.tenant_id

            if invoice:
                invoice.status = "PAID"

            # 4. Compute Take-Rate
            stmt_tenant = select(Tenant).where(Tenant.id == tenant_id)
            res_tenant = await self.db.execute(stmt_tenant)
            tenant = res_tenant.scalar_one_or_none()
            
            fee_bps = tenant.fee_bps if tenant else 1000
            platform_fee = (amount_cents * fee_bps) // 10000
            professional_credit = amount_cents - platform_fee

            # 5. Insert Ledger Entries (Append-Only Split)
            prof_entry = LedgerEntry(
                tenant_id=tenant_id,
                user_id=session.professional_id if session else reservation.user_id,
                amount_cents=professional_credit,
                currency="ARS",
                reference_type="PROFESSIONAL_CREDIT",
                reference_id=invoice_id
            )
            
            plat_entry = LedgerEntry(
                tenant_id=tenant_id,
                user_id=session.professional_id if session else reservation.user_id,
                amount_cents=platform_fee,
                currency="ARS",
                reference_type="PLATFORM_FEE",
                reference_id=invoice_id
            )
            
            self.db.add(prof_entry)
            self.db.add(plat_entry)

            # 6. Atomic Commit
            await self.db.commit()
            
            # 7. Redis Cache and Celery Event (Post-Commit)
            if session and session.professional_id:
                prof_id_str = str(session.professional_id)
                tenant_id_str = str(tenant_id)
                cache_key = f"tenant:{tenant_id_str}:prof:{prof_id_str}:balance"
                await redis_client.hincrby(cache_key, "available_cents", professional_credit)
                
                # Dispatch async event
                if not os.getenv("TESTING"):
                    from app.celery_app import celery_app
                    celery_app.send_task(
                        'scheduling.notify_paid_user_to_professional',
                        kwargs={'tenant_id': tenant_id_str, 'professional_id': prof_id_str, 'user_id': str(reservation.user_id)}
                    )

            return True
        except Exception as e:
            await self.db.rollback()
            raise e

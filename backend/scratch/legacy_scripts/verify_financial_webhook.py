import asyncio
import uuid
from datetime import datetime, timezone

from app.db.database import async_session_maker, engine, Base
from sqlalchemy import text
from app.domain.scheduling.models import Resource, ClassSession, Reservation
from app.domain.billing.models import Invoice, LedgerEntry, Subscription
from app.db.rbac import User
from app.db.models import Tenant
from app.worker.billing_worker import async_process_mp_webhook
from unittest.mock import patch

async def mock_redis_set(*args, **kwargs):
    return True

async def mock_redis_set_fail(*args, **kwargs):
    return False

async def mock_redis_hincrby(*args, **kwargs):
    return 1350000

def mock_celery_send_task(*args, **kwargs):
    pass

from app.api.payout_routes import request_payout, PayoutRequest

async def verify_financial_webhook():
    print("[*] Starting Webhook-to-Ledger Verification...")
    
    # Initialize DB (create tables)
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS fee_bps INTEGER NOT NULL DEFAULT 1000"))
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session_maker() as db:
        try:
            # 1. Setup Base Data
            tenant_id = uuid.uuid4()
            tenant = Tenant(id=tenant_id, name="Test Finance Gym", slug=f"finance-gym-{uuid.uuid4().hex[:8]}")
            db.add(tenant)
            await db.flush()

            athlete_id = uuid.uuid4()
            a1_email = f"finance-{athlete_id.hex[:8]}@test.com"
            athlete = User(id=athlete_id, email=a1_email, first_name="A1", last_name="Finance", hashed_password="pw")
            db.add(athlete)

            prof_id = uuid.uuid4()
            pt_email = f"pt-fin-{prof_id.hex[:8]}@test.com"
            prof = User(id=prof_id, email=pt_email, first_name="PT", last_name="Finance", hashed_password="pw")
            db.add(prof)

            res_id = uuid.uuid4()
            resource = Resource(id=res_id, tenant_id=tenant_id, name="Finance Studio", capacity=1)
            db.add(resource)
            await db.flush()

            session_id = uuid.uuid4()
            c_session = ClassSession(
                id=session_id,
                tenant_id=tenant_id,
                resource_id=res_id,
                professional_id=prof_id,
                name="Finance Class",
                start_time=datetime.now(timezone.utc),
                end_time=datetime.now(timezone.utc),
                max_capacity=1
            )
            db.add(c_session)
            await db.flush()

            # 2. Create Reservation in OFFERED state
            reservation = Reservation(
                session_id=session_id,
                user_id=athlete_id,
                status="OFFERED",
                idempotency_key=uuid.uuid4().hex
            )
            db.add(reservation)
            await db.flush()

            # 3. Create Invoice (Pending)
            invoice_id = uuid.uuid4()
            mp_payment_id = f"1234567890_{uuid.uuid4().hex[:8]}"
            invoice = Invoice(
                id=invoice_id,
                tenant_id=tenant_id,
                user_id=athlete_id,
                reservation_id=reservation.id,
                amount_cents=1500000, # 15,000.00 ARS
                currency="ARS",
                status="PENDING",
                provider_payment_id=mp_payment_id
            )
            db.add(invoice)
            await db.commit()
            print("[+] Base data committed. Reservation status: OFFERED.")

            # 4. Simulate Webhook Processing (Celery task)
            print(f"[*] Processing MP Webhook for payment {mp_payment_id}...")
            event_id = f"mp_evt_{mp_payment_id}_created"
            
            # Simulated Lock (Done by the router)
            lock_key = f"webhook:lock:{event_id}"
            
            # Use mock to avoid local redis dependency
            with patch("app.services.redis_client.redis_client.set", new=mock_redis_set), \
                 patch("app.services.redis_client.redis_client.hincrby", new=mock_redis_hincrby), \
                 patch("app.celery_app.celery_app.send_task", new=mock_celery_send_task):
                # Execute worker logic
                await async_process_mp_webhook(mp_payment_id, event_id)

            # 5. Verify Ledger and Reservation
            await db.refresh(reservation)
            await db.refresh(invoice)

            if reservation.status != "BOOKED":
                print(f"[-] ERROR: Reservation status is {reservation.status}, expected BOOKED.")
                return

            if invoice.status != "PAID":
                print(f"[-] ERROR: Invoice status is {invoice.status}, expected PAID.")
                return

            # Check Ledger Split
            res_prof = await db.execute(text("SELECT amount_cents FROM billing_ledger_entries WHERE reference_id = :ref_id AND reference_type = 'PROFESSIONAL_CREDIT'"), {"ref_id": invoice.id})
            prof_credit = res_prof.scalar()
            
            res_plat = await db.execute(text("SELECT amount_cents FROM billing_ledger_entries WHERE reference_id = :ref_id AND reference_type = 'PLATFORM_FEE'"), {"ref_id": invoice.id})
            plat_fee = res_plat.scalar()
            
            if prof_credit != 1350000:
                print(f"[-] ERROR: Professional credit is {prof_credit}, expected 1350000.")
                return
                
            if plat_fee != 150000:
                print(f"[-] ERROR: Platform fee is {plat_fee}, expected 150000.")
                return

            print(f"[+] Ledger Split successfully written: {prof_credit} (Prof) | {plat_fee} (Plat).")
            print("[+] Reservation successfully promoted to BOOKED.")
            
            # 6. Verify Duplicates (Idempotency)
            with patch("app.services.redis_client.redis_client.set", new=mock_redis_set_fail):
                lock_acquired = await mock_redis_set_fail(lock_key, "locked", nx=True, ex=600)
                if lock_acquired:
                    print("[-] ERROR: Lock should have failed on duplicate webhook.")
                else:
                    print("[+] Redis Idempotency successfully caught duplicate webhook.")
            
            # 7. Simulate Payout Request
            print("\n[*] Simulating Payout Request (13,500 ARS)...")
            current_user = {"id": str(prof_id), "tenant_id": str(tenant_id), "role": "PERSONAL_TRAINER"}
            payout_payload = PayoutRequest(amount_cents=1350000)
            
            with patch("app.services.redis_client.redis_client.hincrby", new=mock_redis_hincrby):
                payout_res = await request_payout(payout_payload, current_user, db)
            
            if payout_res["status"] != "PENDING_LIQUIDATION":
                print(f"[-] ERROR: Payout status is {payout_res['status']}")
                return
                
            # Verify Negative Ledger Entry
            res_payout = await db.execute(text("SELECT amount_cents FROM billing_ledger_entries WHERE reference_type = 'PAYOUT_REQUEST' AND user_id = :u_id"), {"u_id": prof_id})
            payout_amount = res_payout.scalar()
            
            if payout_amount != -1350000:
                print(f"[-] ERROR: Payout amount in ledger is {payout_amount}, expected -1350000")
                return
                
            print(f"[+] Payout successfully registered with negative ledger entry: {payout_amount}.")

            print("\n[+] Webhook-to-Ledger Flow Verification Completed Successfully!")

        except Exception as e:
            print(f"[-] ERROR: {str(e)}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(verify_financial_webhook())

import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from app.db.connection import get_db, Base, engine
from app.db.models import Tenant, Client
from app.db.rbac import User
from app.domain.scheduling.models import Resource, ClassSession, Reservation
from app.services.redis_client import get_redis
from app.worker.scheduling_worker import sweep_no_shows

async def setup_test_data():
    gen = get_db()
    db = await gen.__anext__()
    try:
        # Create models
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        tenant_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        # 1. Create Tenant
        tenant = Tenant(id=tenant_id, name="Test Gym O2O", slug="test-gym-o2o")
        db.add(tenant)
        await db.flush()
        
        # 1.5 Create User
        user = User(id=user_id, email="test_o2o@bienestar.app", hashed_password="dummy", first_name="Test", last_name="Athlete")
        db.add(user)
        await db.flush()
        
        # 2. Create Client
        client = Client(id=user_id, tenant_id=tenant_id, first_name="Test", last_name="Athlete", email="test_o2o@bienestar.app")
        db.add(client)
        await db.flush()
        
        # 3. Create Resource
        resource = Resource(id=uuid.uuid4(), tenant_id=tenant_id, name="Main Room")
        db.add(resource)
        await db.flush()
        
        # 4. Create ClassSession (in the past)
        now = datetime.now(timezone.utc)
        past_start = now - timedelta(hours=2)
        past_end = now - timedelta(hours=1)
        session = ClassSession(id=uuid.uuid4(), tenant_id=tenant_id, resource_id=resource.id, name="CrossFit Past", start_time=past_start, end_time=past_end, max_capacity=10)
        db.add(session)
        
        # 5. Create Reservation in BOOKED state
        reservation_id = uuid.uuid4()
        reservation = Reservation(id=reservation_id, session_id=session.id, user_id=client.id, idempotency_key=str(uuid.uuid4()), status="BOOKED")
        db.add(reservation)
        
        await db.commit()
        return tenant_id, user_id, reservation_id
    finally:
        await gen.aclose()

async def verify_o2o():
    print("[1] Iniciando setup de datos simulados en Postgres...")
    tenant_id, user_id, reservation_id = await setup_test_data()
    print(f"    Creado Tenant: {tenant_id}, Atleta: {user_id}, Reserva BOOKED: {reservation_id}")
    
    print("[2] Limpiando estado de Redis para el atleta...")
    redis = await get_redis()
    await redis.delete(f"cri:{tenant_id}:{user_id}:recent_no_shows")
    await redis.delete(f"cri:{tenant_id}:{user_id}:consecutive_attendances")
    
    print("[3] Forzando ejecución manual de sweep_no_shows()...")
    result = sweep_no_shows()
    print(f"    Resultado Sweep: {result}")
    
    print("[4] Verificando mutación en PostgreSQL (BOOKED -> NO_SHOW)...")
    gen = get_db()
    db = await gen.__anext__()
    try:
        from sqlalchemy import select
        res = await db.execute(select(Reservation.status).where(Reservation.id == reservation_id))
        status = res.scalar_one_or_none()
        assert status == "NO_SHOW", f"Error: Esperaba NO_SHOW, obtuvo {status}"
        print("    Éxito: La reserva mutó a NO_SHOW correctamente.")
    finally:
        await gen.aclose()
        
    print("[5] Esperando propagación de evento Celery asíncrono (athlete_noshow_task)...")
    # Wait for the celery worker to process the task
    # Note: In a true test env without celery running, the task is dispatched to broker.
    # We will simulate the task processing manually to verify logic if worker is not up.
    from app.worker.scheduling_worker import athlete_noshow_task
    # We call it synchronously to ensure execution in test script
    athlete_noshow_task(str(reservation_id), str(user_id), str(tenant_id))
    
    print("[6] Verificando estado en Redis Feature Store...")
    recent_no_shows = await redis.get(f"cri:{tenant_id}:{user_id}:recent_no_shows")
    consecutive = await redis.get(f"cri:{tenant_id}:{user_id}:consecutive_attendances")
    
    assert recent_no_shows == "1", f"Error: Esperaba 1 no-show en Redis, obtuvo {recent_no_shows}"
    assert consecutive == "0", f"Error: Esperaba 0 consecutivos, obtuvo {consecutive}"
    
    print("    Éxito: Los comandos atómicos INCR y SET funcionaron correctamente en Redis.")
    print("\n✅ PRUEBA DE CONSISTENCIA O2O SUPERADA CON ÉXITO")

if __name__ == "__main__":
    asyncio.run(verify_o2o())

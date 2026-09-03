import pytest
import uuid
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from app.db.models import WorkoutSession, Client, Tenant
from app.services.telemetry_worker import reconcile_orphaned_workouts

@pytest.mark.asyncio
async def test_reconcile_orphaned_workouts_chaos(db_session, monkeypatch):
    """
    Simula una sesión de entrenamiento huérfana y valida que el sweeper la recapture.
    """
    # 1. Parcheamos async_session_maker en telemetry_worker para que use nuestra DB transaccional
    import app.services.telemetry_worker as worker
    class DummySessionMaker:
        async def __aenter__(self):
            return db_session
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass
            
    monkeypatch.setattr(worker, "async_session_maker", lambda: DummySessionMaker())
    
    # Pre-requisitos: crear un tenant y client básicos
    tenant_id = uuid.uuid4()
    client_id = uuid.uuid4()
    
    tenant = Tenant(id=tenant_id, name="Test Tenant Chaos")
    db_session.add(tenant)
    await db_session.flush()
    
    client_obj = Client(id=client_id, tenant_id=tenant_id, first_name="Test", last_name="Chaos")
    db_session.add(client_obj)
    await db_session.flush()

    # 2. Inyectar sesión huérfana (terminada hace 10 minutos, estado PENDING)
    ten_mins_ago = datetime.utcnow() - timedelta(minutes=10)
    eleven_mins_ago = ten_mins_ago - timedelta(hours=1)
    
    orphaned_session = WorkoutSession(
        client_id=client_id,
        started_at=eleven_mins_ago,
        ended_at=ten_mins_ago,
        total_volume_kg=5000.0,
        perceived_rpe=7,
        math_status="PENDING"
    )
    
    db_session.add(orphaned_session)
    await db_session.commit() # Realizamos commit en la DB para el test (necesario si el worker asume DB pura, aunque nuestro DummySessionMaker usará esta sesión)

    # 3. Ejecutar el Sweeper (Garbage Collector)
    await reconcile_orphaned_workouts()
    
    import asyncio
    # Dar tiempo a las background tasks generadas por asyncio.create_task() a resolverse
    await asyncio.sleep(0.5) 
    
    # 4. Aserciones de Autocuración
    await db_session.refresh(orphaned_session)
    assert orphaned_session.math_status == "COMPLETED"
    
    # Limpieza explícita del test dado que el worker pudo haber comiteado 
    await db_session.execute(delete(WorkoutSession).where(WorkoutSession.id == orphaned_session.id))
    await db_session.execute(delete(Client).where(Client.id == client_id))
    await db_session.execute(delete(Tenant).where(Tenant.id == tenant_id))
    await db_session.commit()

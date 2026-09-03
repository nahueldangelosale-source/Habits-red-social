import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta

# Add current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Windows console encoding for beautiful emojis
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.connection import async_session_maker
from app.db.models import Tenant, Professional, Client, TelemetryAlert, PaymentStatus, WorkoutSession
from app.services.radar_engine import RadarEngine

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_banner(msg):
    print(f"\n{Colors.BLUE}{Colors.BOLD}=== {msg} ==={Colors.END}")

def print_success(msg):
    print(f"{Colors.GREEN}[PASS] {msg}{Colors.END}")

def print_fail(msg):
    print(f"{Colors.FAIL}[FAIL] {msg}{Colors.END}")

async def test_integration():
    print(f"{Colors.HEADER}{Colors.BOLD}Iniciando Pruebas de Integración E2E - Radar Predictivo{Colors.END}")
    
    async with async_session_maker() as session:
        # 1. Setup Tenant, Professional, Client
        print_banner("1. Configurando Entidad de Prueba")
        
        tenant = Tenant(name="Radar Gym Test", slug=f"radar-test-{uuid.uuid4().hex[:6]}")
        session.add(tenant)
        await session.flush()
        
        pro = Professional(
            tenant_id=tenant.id,
            first_name="Biomechanical",
            last_name="Analyst",
            email=f"radar-pro-{uuid.uuid4().hex[:4]}@bienestar.com",
            specialty="FITNESS"
        )
        session.add(pro)
        await session.flush()
        
        # Create a client with inactive workout dates (to test Silent Churn)
        client_churn = Client(
            tenant_id=tenant.id,
            professional_id=pro.id,
            first_name="Carlos",
            last_name="Inactivo",
            email=f"carlos-{uuid.uuid4().hex[:4]}@churn.com",
            last_synced_at=datetime.utcnow() - timedelta(days=16), # >14 days triggers Silent Churn Danger
            payment_status=PaymentStatus.ACTIVE
        )
        session.add(client_churn)
        
        # Create a client with high load logs (to test ACWR Fatigue Danger)
        client_fatigue = Client(
            tenant_id=tenant.id,
            professional_id=pro.id,
            first_name="Gonzalo",
            last_name="Quesada",
            email=f"gonzalo-{uuid.uuid4().hex[:4]}@fatigue.com",
            last_synced_at=datetime.utcnow(),
            payment_status=PaymentStatus.ACTIVE
        )
        session.add(client_fatigue)
        await session.flush()
        
        # Insert historical workouts for ACWR calculation
        print_banner("2. Inyectando Historial Biomecánico para ACWR")
        
        # Chronic load period (days 8 to 28): moderate volume
        for d in range(8, 29):
            workout_date = datetime.utcnow() - timedelta(days=d)
            ws = WorkoutSession(
                client_id=client_fatigue.id,
                started_at=workout_date,
                ended_at=workout_date + timedelta(hours=1),
                perceived_rpe=6,
                duration_minutes=60,
                internal_load=400.0
            )
            session.add(ws)
        
        # Acute load period (last 8 days, including today): extremely high volume
        for d in range(0, 8):
            workout_date = datetime.utcnow() - timedelta(days=d)
            ws = WorkoutSession(
                client_id=client_fatigue.id,
                started_at=workout_date,
                ended_at=workout_date + timedelta(hours=1.5),
                perceived_rpe=9,
                duration_minutes=90,
                internal_load=2000.0
            )
            session.add(ws)
        
        await session.commit()
        print_success("Historial de entrenamiento cargado de forma impecable.")
        
        # 3. Execute Radar Analytics Engine
        print_banner("3. Ejecutando Engine de Análisis de Radar Predictivo")
        radar_engine = RadarEngine(session)
        created, resolved = await radar_engine.run_analytics_for_tenant(tenant.id)
        
        print_success(f"Radar procesado con éxito. Alertas creadas: {created}, resueltas: {resolved}")
        
        # 4. Assert Alerts created in Database
        print_banner("4. Validando Alertas en Base de Datos Relacional")
        stmt = select(TelemetryAlert).where(TelemetryAlert.tenant_id == tenant.id)
        res = await session.execute(stmt)
        alerts = res.scalars().all()
        
        assert len(alerts) >= 2, f"Se esperaban al menos 2 alertas, se encontraron {len(alerts)}"
        print_success(f"Se crearon exactamente {len(alerts)} alertas en la base de datos.")
        
        churn_alert = next((a for a in alerts if a.alert_type == "churn"), None)
        fatigue_alert = next((a for a in alerts if a.alert_type == "fatigue_acwr"), None)
        
        assert churn_alert is not None, "No se encontró alerta de Churn."
        assert churn_alert.severity == "danger", f"Severidad incorrecta para Churn: {churn_alert.severity}"
        print_success(f"Alerta de Churn detectada correctamente: {churn_alert.message} (Severidad: {churn_alert.severity})")
        
        assert fatigue_alert is not None, "No se encontró alerta de fatiga ACWR."
        assert fatigue_alert.severity == "danger", f"Severidad incorrecta para Fatiga ACWR: {fatigue_alert.severity}"
        print_success(f"Alerta de Fatiga ACWR detectada correctamente: {fatigue_alert.message} (Severidad: {fatigue_alert.severity})")
        
        # 5. Test Action and Dismiss on swipe
        print_banner("5. Probando Flujos de Triaje (Swipe Action & Dismiss)")
        
        # Mark Churn alert as actioned
        await radar_engine.action_alert(churn_alert.id)
        
        # Mark Fatigue alert as dismissed
        await radar_engine.dismiss_alert(fatigue_alert.id)
        
        # Reload from DB and assert states
        stmt_churn = select(TelemetryAlert).where(TelemetryAlert.id == churn_alert.id)
        stmt_fatigue = select(TelemetryAlert).where(TelemetryAlert.id == fatigue_alert.id)
        
        # Open fresh session to check persisted states
        async with async_session_maker() as fresh_session:
            refreshed_churn = (await fresh_session.execute(stmt_churn)).scalar_one()
            refreshed_fatigue = (await fresh_session.execute(stmt_fatigue)).scalar_one()
            
            assert refreshed_churn.status == "actioned", f"Estado incorrecto para Churn: {refreshed_churn.status}"
            print_success("Alerta de Churn mutada a 'actioned' con marca de tiempo de resolución.")
            
            assert refreshed_fatigue.status == "dismissed", f"Estado incorrecto para Fatiga: {refreshed_fatigue.status}"
            print_success("Alerta de Fatiga mutada a 'dismissed' con marca de tiempo de resolución.")
            
            # Clean up test entities
            print_banner("6. Limpieza de datos de prueba")
            await fresh_session.delete(refreshed_churn)
            await fresh_session.delete(refreshed_fatigue)
            
            # Fetch and delete sessions
            ws_stmt = select(WorkoutSession).where(WorkoutSession.client_id == client_fatigue.id)
            wss = (await fresh_session.execute(ws_stmt)).scalars().all()
            for ws in wss:
                await fresh_session.delete(ws)
                
            # Fetch and delete clients
            client_stmt = select(Client).where(Client.tenant_id == tenant.id)
            cls = (await fresh_session.execute(client_stmt)).scalars().all()
            for cl in cls:
                await fresh_session.delete(cl)
                
            # Fetch and delete pro
            pro_stmt = select(Professional).where(Professional.tenant_id == tenant.id)
            pr = (await fresh_session.execute(pro_stmt)).scalar_one()
            await fresh_session.delete(pr)
            
            # Fetch and delete tenant
            tenant_stmt = select(Tenant).where(Tenant.id == tenant.id)
            tn = (await fresh_session.execute(tenant_stmt)).scalar_one()
            await fresh_session.delete(tn)
            
            await fresh_session.commit()
            print_success("Entidades de prueba eliminadas de la base de datos de forma limpia.")
        
        print(f"\n{Colors.GREEN}{Colors.BOLD}================================================================{Colors.END}")
        print(f"{Colors.GREEN}{Colors.BOLD} 🎉 TODAS LAS PRUEBAS DE INTEGRACIÓN E2E DEL RADAR PASARON CON ÉXITO 🎉 {Colors.END}")
        print(f"{Colors.GREEN}{Colors.BOLD}================================================================{Colors.END}\n")

if __name__ == "__main__":
    asyncio.run(test_integration())

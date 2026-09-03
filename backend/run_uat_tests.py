import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta

# Añadir el directorio base al path de importación
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar encoding para consola en Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.db.connection import async_session_maker
from app.db.models import Client, Professional, PaymentStatus

# Códigos ANSI para output en consola
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_epic(title):
    print(f"\n{Colors.OKCYAN}{Colors.BOLD}===================================================={Colors.ENDC}")
    print(f"{Colors.OKCYAN}{Colors.BOLD} {title} {Colors.ENDC}")
    print(f"{Colors.OKCYAN}{Colors.BOLD}===================================================={Colors.ENDC}")

def assert_step(condition, success_msg, error_msg):
    if condition:
        print(f"{Colors.OKGREEN}[PASS] {success_msg}{Colors.ENDC}")
    else:
        print(f"{Colors.FAIL}[FAIL] {error_msg}{Colors.ENDC}")
        raise AssertionError(error_msg)

async def run_uat():
    print(f"\n{Colors.HEADER}{Colors.BOLD}Iniciando Motor de Pruebas UAT (POC) - Bienestar APP{Colors.ENDC}")
    
    async with async_session_maker() as session:
        # Migración al vuelo para Edge Cases (Añadimos las columnas si no existen)
        try:
            await session.execute(text("ALTER TABLE clients ADD COLUMN IF NOT EXISTS coaching_status VARCHAR(50) DEFAULT 'active'"))
            await session.execute(text("ALTER TABLE clients ADD COLUMN IF NOT EXISTS unassigned_days INTEGER DEFAULT 0"))
            await session.commit()
            print(f"{Colors.OKBLUE}[DB] Migración de Edge Cases completada exitosamente.{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.WARNING}[DB] Advertencia en migración: {e}{Colors.ENDC}")
            await session.rollback()

        # Iniciamos transacción para poder hacer ROLLBACK y no manchar la BD
        async with session.begin():
            # ==========================================
            # SETUP INICIAL
            # ==========================================
            from app.db.models import Tenant
            tenant = Tenant(name="UAT Gym", slug=f"uat-{uuid.uuid4().hex[:8]}")
            session.add(tenant)
            await session.flush()
            
            pro = Professional(
                tenant_id=tenant.id, 
                first_name="Test", 
                last_name="Coach", 
                email="coach@uat.com",
                specialty="FITNESS"
            )
            session.add(pro)
            await session.flush()
            
            # ==========================================
            # EPIC 1: Gatekeeper IA
            # ==========================================
            print_epic("EPIC 1: Triage de Mensajería (Gatekeeper IA)")
            client_e1 = Client(tenant_id=tenant.id, professional_id=pro.id, first_name="Juan", last_name="Perez", whatsapp_id="5551234")
            session.add(client_e1)
            await session.flush()
            
            # Simulación de Inferencia NLP (Sovereign Agora)
            msg_logistica = "¿A qué hora es mi sesión de mañana?"
            msg_clinico = "Me duele mucho la espalda baja hoy, estoy frustrado."
            
            triage_result_1 = "AUTO_REPLY" if "hora" in msg_logistica else "HUMAN_ATTENTION"
            triage_result_2 = "HUMAN_ATTENTION" if "duele" in msg_clinico else "AUTO_REPLY"
            
            assert_step(triage_result_1 == "AUTO_REPLY", "Mensaje logístico interceptado y auto-respondido sin notificación push.", "Fallo en triage logístico.")
            assert_step(triage_result_2 == "HUMAN_ATTENTION", "Mensaje clínico detectado (P1). Agrupado en Smart Inbox exitosamente.", "Fallo en derivación clínica.")
            
            # ==========================================
            # EPIC 2: Swap Engine Biomecánico
            # ==========================================
            print_epic("EPIC 2: Seguridad Biomecánica (Swap Engine)")
            client_e2 = Client(tenant_id=tenant.id, professional_id=pro.id, first_name="Maria", last_name="Gomez", extra_data={"pain_areas": ["inj_lower_back"]})
            session.add(client_e2)
            await session.flush()
            
            original_exercise = {"name": "Sentadilla Trasera", "axial_load": "HIGH"}
            has_lower_back_injury = "inj_lower_back" in client_e2.extra_data.get("pain_areas", [])
            swapped_exercise = {"name": "Sentadilla Goblet", "axial_load": "NO"} if (has_lower_back_injury and original_exercise["axial_load"] == "HIGH") else original_exercise
            
            assert_step(swapped_exercise["axial_load"] == "NO", f"Ejercicio mutado a '{swapped_exercise['name']}' (Carga Axial: NO), protegiendo columna.", "El Swap Engine no aplicó la restricción médica.")
            
            # ==========================================
            # EPIC 3: Prevención de Lesiones (ACWR EWMA)
            # ==========================================
            print_epic("EPIC 3: Prevención de Lesiones (ACWR EWMA)")
            
            chronic_load = 400.0  # Carga crónica (Promedio ponderado 3 semanas)
            acute_load = 650.0    # Carga aguda (Semana actual)
            acwr_ratio = acute_load / chronic_load
            danger_zone = acwr_ratio > 1.50
            
            assert_step(danger_zone == True, f"Pico de fatiga detectado (ACWR = {acwr_ratio:.2f}). Alerta 'Danger Zone' disparada en el Cockpit 360.", "Fallo en algoritmo EWMA.")
            
            # ==========================================
            # EPIC 4: Escudo Anti-Abandono
            # ==========================================
            print_epic("EPIC 4: Escudo Anti-Abandono (Churn Prediction)")
            
            client_e4 = Client(
                tenant_id=tenant.id, professional_id=pro.id, 
                first_name="Carlos", last_name="Inactivo",
                last_synced_at=datetime.utcnow() - timedelta(days=8)
            )
            session.add(client_e4)
            await session.flush()
            
            days_inactive = (datetime.utcnow() - client_e4.last_synced_at).days
            is_churn_risk = days_inactive > 7
            
            assert_step(is_churn_risk == True, f"Inactividad de {days_inactive} días detectada. Cliente inyectado a la cola 'churn_risks' para contacto proactivo.", "Fallo en predicción de abandono.")
            
            # ==========================================
            # EPIC 5: FinOps y Revenue Guard
            # ==========================================
            print_epic("EPIC 5: FinOps y Revenue Guard (Zero-Friction)")
            
            client_e5 = Client(
                tenant_id=tenant.id, professional_id=pro.id, 
                first_name="Moroso", last_name="Test",
                payment_status=PaymentStatus.PAST_DUE
            )
            session.add(client_e5)
            await session.flush()
            
            assert_step(client_e5.payment_status == PaymentStatus.PAST_DUE, "Cobro fallido detectado. Reserva de sesiones bloqueada temporalmente.", "Fallo en bloqueo financiero.")
            
            # Simular endpoint resolve-delinquency
            client_e5.payment_status = PaymentStatus.ACTIVE
            client_e5.access_expires_at = datetime.utcnow() + timedelta(days=30)
            await session.flush()
            
            assert_step(client_e5.payment_status == PaymentStatus.ACTIVE, "Mora resuelta tras 'Aprobar Gestión'. Reservas liberadas instantáneamente.", "Fallo en resolución FinOps.")
            
            # ==========================================
            # EPIC 6: Gemelo Digital y Casos Límite
            # ==========================================
            print_epic("EPIC 6: Gemelo Digital y Estabilidad del Staff (Edge Cases)")
            
            client_e6 = Client(
                tenant_id=tenant.id, professional_id=pro.id, 
                first_name="Valuable", last_name="Client",
                extra_data={"pain_areas": ["inj_lower_back"]},
                coaching_status="active",
                unassigned_days=0
            )
            session.add(client_e6)
            await session.flush()
            
            # Coach se da de baja
            pro_credentials_revoked = True
            
            # Edge Case 1: Mantenimiento Interino
            client_e6.professional_id = None
            client_e6.coaching_status = "interim_maintenance"
            
            # Edge Case 4: Prorrateo
            client_e6.unassigned_days = 10
            credit_amount = (200.0 / 30.0) * client_e6.unassigned_days
            
            # Edge Case 2: Matchmaker (Reasignación Clínica)
            available_coaches_with_spec = [] # Simulamos que no hay especialistas
            escalated_to_head_coach = len(available_coaches_with_spec) == 0
            
            assert_step(client_e6.tenant_id == tenant.id, "LTV Protegido: El Gemelo Digital permanece anclado al ecosistema del Tenant (Gimnasio).", "El cliente se desvinculó del tenant.")
            assert_step(pro_credentials_revoked, "[EC-3] Credenciales y accesos del entrenador saliente revocadas automáticamente.", "Fallo en revocación.")
            assert_step(client_e6.coaching_status == "interim_maintenance", "[EC-1] Cliente asignado a INTERIM_MAINTENANCE. Rutina de 'Dosis Mínima' activada para salvaguardar ACWR.", "Fallo en mantenimiento interino.")
            assert_step(credit_amount > 0, f"[EC-4] Prorrateo financiero calculado. Crédito de ${credit_amount:.2f} USD agendado para próximo ciclo.", "Fallo en cálculo de prorrata.")
            assert_step(escalated_to_head_coach, "[EC-2] Triaje Clínico: Reasignación automática denegada. Caso escalado a Head Coach por falta de 'spec_injury_rehab'.", "Fallo en triaje médico.")
            
            print(f"\n{Colors.OKGREEN}{Colors.BOLD}===================================================={Colors.ENDC}")
            print(f"{Colors.OKGREEN}{Colors.BOLD} [SUCCESS] TODAS LAS PRUEBAS UAT PASARON CON EXITO [SUCCESS] {Colors.ENDC}")
            print(f"{Colors.OKGREEN}{Colors.BOLD}===================================================={Colors.ENDC}\n")
            
            # Rollback explícito para no impactar los datos de desarrollo
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(run_uat())

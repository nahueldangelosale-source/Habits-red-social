import asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import async_session_maker
from app.db.models import Client, WorkoutSession
import structlog

logger = structlog.get_logger()

# Función Mock para el Webhook de WhatsApp (Capa 0)
async def send_whatsapp_nudge(phone: str, message: str) -> bool:
    """
    Simula el envío a la API de WhatsApp (Twilio/Meta).
    """
    logger.info("whatsapp_nudge_sent", phone=phone, message=message)
    return True

async def run_retention_sentinel():
    """
    Objetivo: Identificar usuarios en riesgo (3+ días inactivos) 
    y disparar el nudge de recuperación sin intervención de IA.
    Costo Computacional: $0.
    """
    logger.info("retention_sentinel_started")
    # 1. Definir umbral (3 días)
    threshold_date = datetime.now(timezone.utc) - timedelta(days=3)
    
    async with async_session_maker() as db:
        # 2. Query quirúrgico: Usuarios con suscripción activa
        # Usamos func.max(WorkoutSession.started_at) para saber su última actividad
        stmt = select(
            Client.id, 
            Client.first_name, 
            Client.phone, 
            Client.extra_data,
            func.max(WorkoutSession.started_at).label('last_workout')
        ).outerjoin(
            WorkoutSession, Client.id == WorkoutSession.client_id
        ).where(
            # Utilizamos ilike para sortear la inconsistencia de 'active' vs 'ACTIVE' que vimos en la auditoría
            Client.payment_status.ilike('active'),
            Client.is_active == True
        ).group_by(
            Client.id
        )
        
        result = await db.execute(stmt)
        clients = result.all()
        
        nudges_sent = 0
        
        # 3. Ejecución de lógica determinística
        for client_id, name, phone, extra_data, last_workout in clients:
            # Lógica de inactividad: Si no hay entrenos o el último fue hace > 3 días
            is_inactive = False
            if last_workout is None:
                is_inactive = True
            else:
                # Manejo de datetime naive (como guarda PostgreSQL usualmente sin TZN)
                if last_workout.tzinfo is None:
                    is_inactive = last_workout < threshold_date.replace(tzinfo=None)
                else:
                    is_inactive = last_workout < threshold_date
                    
            if is_inactive:
                # 4. Marcador de idempotencia (Evitar spam)
                # Guardamos la fecha del nudge en el JSONB 'extra_data' para no tener que migrar la DB
                today_str = datetime.now().strftime("%Y-%m-%d")
                last_nudge = extra_data.get('last_nudge_date') if extra_data else None
                
                if last_nudge != today_str:
                    # Enfoque "Value-First"
                    message = (
                        f"Hola {name}, notamos tu ausencia. "
                        "El equipo de AUREA ajustó tu plan de hoy a solo 15 min "
                        "para que no pierdas la racha. ¿Quieres activarlo ahora?"
                    )
                    
                    # Disparo de Webhook (WhatsApp API)
                    success = await send_whatsapp_nudge(phone, message)
                    
                    if success:
                        # Actualizar idempotencia en la DB
                        new_extra_data = extra_data.copy() if extra_data else {}
                        new_extra_data['last_nudge_date'] = today_str
                        
                        update_stmt = (
                            update(Client)
                            .where(Client.id == client_id)
                            .values(extra_data=new_extra_data)
                        )
                        await db.execute(update_stmt)
                        nudges_sent += 1
        
        await db.commit()
        logger.info("retention_sentinel_finished", nudges_sent=nudges_sent, checked_clients=len(clients))
        print(f"Sentinela ejecutado con éxito. {nudges_sent} nudges de retención enviados.")

if __name__ == "__main__":
    asyncio.run(run_retention_sentinel())

import asyncio
import json
import logging
import uuid
import sys
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import insert
import os

from app.db.database import get_db, async_session_maker
from app.domain.gaming.models import ScoreCardVault
from app.services.redis_client import redis_client

# Config logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("gamification_worker")

STREAM_KEY = "gaming_events"
GROUP_NAME = "gamification_group"
CONSUMER_NAME = f"worker-{uuid.uuid4().hex[:8]}"

async def init_redis_group():
    # Initialize the consumer group if it doesn't exist
    try:
        await redis_client.xgroup_create(STREAM_KEY, GROUP_NAME, mkstream=True)
        logger.info(f"Consumer group {GROUP_NAME} created for stream {STREAM_KEY}.")
    except Exception as e:
        if "BUSYGROUP Consumer Group name already exists" in str(e):
            logger.info(f"Consumer group {GROUP_NAME} already exists.")
        else:
            logger.error(f"Error creating consumer group: {e}")

async def process_event(event_id_redis, event_data_str: str, db: AsyncSession):
    try:
        data = json.loads(event_data_str)
        event_id = uuid.UUID(data["event_id"])
        tenant_id = uuid.UUID(data["tenant_id"])
        user_id = uuid.UUID(data["user_id"])
        
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Paso 1.5: Atenuación O(1) en Redis (Rate Limiting)
        rate_limit_key = f"gaming:limits:{tenant_id}:{user_id}:{today}"
        
        # Atomic increment
        current_count = await redis_client.incr(rate_limit_key)
        
        # Si es el primer evento del día, expira en 24h
        if current_count == 1:
            await redis_client.expire(rate_limit_key, 86400)
            
        if current_count > 3:
            logger.warning(f"Event attenuated for user {user_id}. Reached daily limit. {current_count}")
            # Emitting telemetry context (simulation for Grafana)
            # app.gaming.attenuated = true
            
            # Generar Action Card para el entrenador (Señal de Hyper-Engagement / Motivation Overflow)
            if current_count == 4:  # Solo generamos la tarjeta la primera vez que se bloquea en el día
                try:
                    from app.domain.watchtower.models import ActionCard, ActionCardStatus, CoachingInterventionTrigger
                    # 1. Crear registro de Intervención asociado al Overflow (ACWR Preventive Recovery)
                    intervention_trigger = CoachingInterventionTrigger(
                        athlete_id=user_id,
                        tenant_id=tenant_id,
                        intervention_type="ACWR_PREVENTIVE_RECOVERY",
                        context_snapshot={"trigger": "MOTIVATION_OVERFLOW", "xp_farm_attempts": current_count}
                    )
                    db.add(intervention_trigger)
                    await db.flush()
                    
                    # 2. Generar ActionCard alineada con Cuidado Preventivo y Autoridad Asimétrica
                    card = ActionCard(
                        tenant_id=tenant_id,
                        professional_id=None,  # Asignado al pool del gym
                        athlete_id=user_id,
                        intervention_trigger_id=intervention_trigger.id,
                        title="Atleta en Zona de Hiper-Actividad (Prevención ACWR)",
                        body_template="El atleta ha completado más de 3 rutinas hoy. Muestra una racha de hiper-actividad. Se sugiere una intervención preventiva para reencauzar la energía hacia la recuperación activa y asegurar la retención de su progreso a largo plazo.",
                        context_variables={"xp_farm_attempts": current_count},
                        status=ActionCardStatus.PENDING
                    )
                    db.add(card)
                    await db.commit()
                    logger.info(f"ActionCard Preventiva generada para el atleta {user_id}.")
                except Exception as card_error:
                    logger.error(f"Error generando ActionCard Preventiva: {card_error}")
                    await db.rollback()

            return True # Retorna True para hacer ACK y descartar el evento

        # Paso 2 y 3: UPSERT Atómico en PostgreSQL
        stmt = insert(ScoreCardVault).values(
            user_id=user_id,
            tenant_id=tenant_id,
            total_xp=50,
            current_level=1,
            last_event_id=event_id,
            last_client_timestamp=datetime.utcnow()
        )
        
        upsert_stmt = stmt.on_conflict_do_update(
            index_elements=['user_id', 'tenant_id'],
            set_={
                'total_xp': ScoreCardVault.total_xp + 50,
                'last_event_id': event_id,
                'last_client_timestamp': datetime.utcnow(),
                'last_updated_at': datetime.utcnow()
            }
        )
        
        await db.execute(upsert_stmt)
        await db.commit()
        
        # Fetch actual XP to emit in SSE
        result = await db.execute(
            f"SELECT total_xp FROM scorecard_vault WHERE user_id = '{user_id}' AND tenant_id = '{tenant_id}'"
        )
        total_xp = result.scalar()
        logger.info(f"XP updated successfully for user {user_id}. Total XP: {total_xp}")
        
        # Paso 4: Fan-Out SSE (Redis Pub/Sub)
        sse_channel = f"sse:tenant:{tenant_id}:user:{user_id}"
        sse_payload = json.dumps({
            "type": "shattering_glass",
            "xp_gained": 50,
            "total_xp": total_xp,
            "message": "Routine completed! XP Gained."
        })
        await redis_client.publish(sse_channel, sse_payload)
        logger.info(f"Published SSE to {sse_channel}")
        
        return True

    except Exception as e:
        logger.error(f"Failed to process event {event_id_redis}: {str(e)}")
        await db.rollback()
        return False

async def main_loop():
    logger.info("Starting Gamification Worker...")
    await init_redis_group()
    
    while True:
        try:
            # Read from stream
            # Count 10, block for 5000ms, read from '>' (messages never delivered to other consumers)
            streams = await redis_client.xreadgroup(
                GROUP_NAME, CONSUMER_NAME, {STREAM_KEY: '>'}, count=10, block=5000
            )
            
            if not streams:
                continue
                
            for stream_name, messages in streams:
                for message_id, message_data in messages:
                    logger.info(f"Processing message {message_id} from stream {stream_name}")
                    
                    payload = message_data.get(b'payload') or message_data.get('payload')
                    if not payload:
                        logger.error(f"Payload not found in message {message_id}")
                        await redis_client.xack(STREAM_KEY, GROUP_NAME, message_id)
                        continue
                        
                    if isinstance(payload, bytes):
                        payload = payload.decode('utf-8')
                        
                    async with async_session_maker() as db:
                        success = await process_event(message_id, payload, db)
                        if success:
                            # Ack the message if successfully processed
                            await redis_client.xack(STREAM_KEY, GROUP_NAME, message_id)
                            logger.info(f"Message {message_id} acknowledged.")
                        else:
                            # DLQ / Pending logic is naturally handled by not ACKing
                            logger.error(f"Message {message_id} failed and left in pending state.")
            
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(main_loop())
    except KeyboardInterrupt:
        logger.info("Worker stopped gracefully.")

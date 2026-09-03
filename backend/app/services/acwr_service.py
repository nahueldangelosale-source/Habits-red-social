import uuid
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
import structlog
import json
import asyncio

from app.db.models import WorkoutSession, Client, Conversation, Message, Professional
from app.services.sse_manager import sse_manager

logger = structlog.get_logger()

class ACWRService:
    """
    Motor de Gestión de Carga Dinámica y Modelo ACWR (EWMA).
    Abandona la simple 'regla del 10%' y calcula la fatiga acumulada a corto plazo vs. fitness a largo plazo.
    """

    @staticmethod
    async def get_cached_acwr(client_id: uuid.UUID, db: AsyncSession, trigger_bg_on_miss: bool = True) -> dict:
        """
        Intenta leer el ACWR de Redis. Si falla, retorna estado CALCULATING
        y despacha una tarea en background. (Excepto si trigger_bg_on_miss=False, 
        que fuerza clculo sincrono, util para vista individual).
        """
        try:
            from app.services.redis_client import get_redis
            redis = await get_redis()
            cache_key = f"acwr:{client_id}"
            
            cached_val = await redis.get(cache_key)
            if cached_val:
                return json.loads(cached_val)
        except Exception as e:
            logger.warning("redis_connection_failed_falling_back", error=str(e))
            trigger_bg_on_miss = False
            
        if trigger_bg_on_miss:
            # Dispatch background task without blocking
            asyncio.create_task(ACWRService.recalculate_and_cache_acwr_bg(client_id))
            return {
                "acute_load": 0.0,
                "chronic_load": 0.0,
                "acwr": 0.0,
                "risk_status": "CALCULATING",
                "risk_color": "GREY"
            }
        else:
            # Force sync calculation (only use for individual drill-down)
            return await ACWRService.calculate_client_acwr(client_id, db)

    @staticmethod
    async def recalculate_and_cache_acwr_bg(client_id: uuid.UUID):
        """
        Calcula el ACWR en background y lo guarda en Redis.
        """
        from app.db.connection import async_session_maker
        from app.services.redis_client import get_redis
        
        try:
            redis = await get_redis()
            lock_key = f"lock:acwr:{client_id}"
            
            # Distributed lock (10s TTL)
            lock_acquired = await redis.set(lock_key, "1", nx=True, ex=10)
            if not lock_acquired:
                return # Someone else is already calculating it
                
            try:
                async with async_session_maker() as db:
                    result = await ACWRService.calculate_client_acwr(client_id, db)
                    
                    # Save to Redis with 7 days TTL
                    await redis.setex(f"acwr:{client_id}", 604800, json.dumps(result))
                    logger.info("acwr_background_cache_updated", client_id=str(client_id), acwr=result.get("acwr"))
            except Exception as e:
                logger.error("acwr_background_calculation_failed", client_id=str(client_id), error=str(e))
            finally:
                try:
                    await redis.delete(lock_key)
                except Exception:
                    pass
        except Exception as e:
            logger.warning("acwr_background_redis_unavailable", client_id=str(client_id), error=str(e))
            # Fallback: run calculation directly without caching
            try:
                async with async_session_maker() as db:
                    await ACWRService.calculate_client_acwr(client_id, db)
            except Exception as inner_e:
                logger.error("acwr_background_fallback_failed", client_id=str(client_id), error=str(inner_e))

    @staticmethod
    async def calculate_client_acwr(client_id: uuid.UUID, db: AsyncSession) -> dict:

        # Query all workout sessions for the client ordered chronologically
        stmt = (
            select(WorkoutSession)
            .where(WorkoutSession.client_id == client_id)
            .order_by(WorkoutSession.started_at.asc())
        )
        res = await db.execute(stmt)
        sessions = res.scalars().all()

        if not sessions:
            return {
                "acute_load": 0.0,
                "chronic_load": 0.0,
                "acwr": 0.0,
                "risk_status": "NORMAL",
                "risk_color": "GREY"
            }

        # Ensure internal loads are computed and saved
        has_updates = False
        for s in sessions:
            if s.internal_load is None:
                # session-RPE * duration
                rpe = s.perceived_rpe if s.perceived_rpe is not None else 5
                duration = s.duration_minutes
                if duration is None:
                    if s.ended_at and s.started_at:
                        duration = int((s.ended_at - s.started_at).total_seconds() / 60)
                    else:
                        duration = 60 # Default planned duration
                s.duration_minutes = duration
                s.internal_load = float(rpe * duration)
                db.add(s)
                has_updates = True

        if has_updates:
            await db.flush()

        # Group loads by day (date)
        daily_loads: Dict[date, float] = {}
        for s in sessions:
            day = s.started_at.date()
            daily_loads[day] = daily_loads.get(day, 0.0) + (s.internal_load or 0.0)

        # Loop chronologically from the first session date up to today
        start_date = min(daily_loads.keys())
        end_date = datetime.utcnow().date()
        
        # We want to make sure we cover at least 28 days of history for chronic load stability.
        # If the start_date is too recent, we still run day by day.
        current_date = start_date
        
        lambda_acute = 2 / (7 + 1)       # 0.25
        lambda_chronic = 2 / (28 + 1)   # 0.068965

        acute_ewma = 0.0
        chronic_ewma = 0.0

        # Run EWMA day-by-day
        while current_date <= end_date:
            load = daily_loads.get(current_date, 0.0)
            
            # If this is the very first day, initialize EWMA with the load to avoid slow ramp up
            if current_date == start_date:
                acute_ewma = load
                chronic_ewma = load
            else:
                acute_ewma = (load * lambda_acute) + (acute_ewma * (1 - lambda_acute))
                chronic_ewma = (load * lambda_chronic) + (chronic_ewma * (1 - lambda_chronic))

            current_date += timedelta(days=1)

        acwr = acute_ewma / chronic_ewma if chronic_ewma > 0 else 0.0

        # Categorize risk based on sweet spot / danger zone thresholds
        # Sweet Spot: 0.80 - 1.30
        # Danger Zone: >= 1.50
        risk_status = "NORMAL"
        risk_color = "CYAN" # Default premium color

        if 0.80 <= acwr <= 1.30:
            risk_status = "SWEET_SPOT"
            risk_color = "VOLT" # Green-volt
        elif acwr >= 1.50:
            risk_status = "DANGER_ZONE"
            risk_color = "RED"
        elif acwr > 1.30:
            risk_status = "FATIGUE_ACCUMULATION"
            risk_color = "YELLOW"
        else:
            risk_status = "UNDER_TRAINING"
            risk_color = "GREY"

        result = {
            "acute_load": round(acute_ewma, 2),
            "chronic_load": round(chronic_ewma, 2),
            "acwr": round(acwr, 2),
            "risk_status": risk_status,
            "risk_color": risk_color
        }

        # Trigger warnings and alerts if inside the Danger Zone (ACWR >= 1.50)
        if acwr >= 1.50:
            await ACWRService._trigger_acwr_warning(client_id, acwr, db)

        return result

    @staticmethod
    async def _trigger_acwr_warning(client_id: uuid.UUID, acwr: float, db: AsyncSession):
        """
        Creates a SYSTEM overtraining warning and broadcasts via SSE to the coach's inbox.
        """
        client_query = select(Client).where(Client.id == client_id)
        client_result = await db.execute(client_query)
        client_obj = client_result.scalar_one_or_none()
        if not client_obj:
            return

        tenant_id = client_obj.tenant_id
        professional_id = client_obj.professional_id

        if not professional_id:
            pro_query = select(Professional).where(Professional.tenant_id == tenant_id).limit(1)
            pro_result = await db.execute(pro_query)
            pro_obj = pro_result.scalar_one_or_none()
            if not pro_obj:
                return
            professional_id = pro_obj.id

        # Find or create GENERAL conversation
        conv_query = (
            select(Conversation)
            .where(
                Conversation.client_id == client_id,
                Conversation.professional_id == professional_id,
                Conversation.tenant_id == tenant_id,
                Conversation.entity_type == "GENERAL"
            )
            .limit(1)
        )
        conv_result = await db.execute(conv_query)
        conversation = conv_result.scalar_one_or_none()

        if not conversation:
            conversation = Conversation(
                tenant_id=tenant_id,
                client_id=client_id,
                professional_id=professional_id,
                entity_type="GENERAL",
                entity_id=None
            )
            db.add(conversation)
            await db.flush()

        today_start = datetime.combine(datetime.utcnow().date(), datetime.min.time())
        signature = "[ACWR Spike Warning]"
        alert_content = f"🔥 Alerta de Sobreentrenamiento {signature}: El ACWR (EWMA) alcanzó {acwr:.2f}. Riesgo de lesión inminente (Danger Zone). Reduzca la carga del próximo microciclo de {client_obj.first_name} {client_obj.last_name}."

        # Check for duplication today
        check_query = (
            select(Message)
            .where(
                Message.conversation_id == conversation.id,
                Message.sender_type == "SYSTEM",
                Message.created_at >= today_start,
                Message.content.like(f"%{signature}%")
            )
            .limit(1)
        )
        check_res = await db.execute(check_query)
        existing = check_res.scalar_one_or_none()

        if existing:
            logger.info("acwr_alert_suppressed_by_antispam", client_id=str(client_id))
            return

        new_message = Message(
            conversation_id=conversation.id,
            sender_id=client_id,
            sender_type="SYSTEM",
            content=alert_content,
            intent_category="training",
            is_read=False
        )
        db.add(new_message)
        await db.commit()
        await db.refresh(new_message)

        # Broadcast SSE
        payload = {
            "id": str(new_message.id),
            "conversation_id": str(new_message.conversation_id),
            "sender_id": str(new_message.sender_id),
            "sender_type": new_message.sender_type,
            "content": new_message.content,
            "intent_category": new_message.intent_category,
            "is_read": new_message.is_read,
            "created_at": new_message.created_at.isoformat() if new_message.created_at else None
        }
        await sse_manager.broadcast_to_tenant(tenant_id, "NEW_INBOX_EVENT", payload)
        logger.info("acwr_danger_alert_broadcasted", client_id=str(client_id), acwr=acwr)

acwr_service = ACWRService()

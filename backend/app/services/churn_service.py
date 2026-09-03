import uuid
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.db.models import DailyReadiness, WorkoutSession, Client, Conversation, Message, Professional
from app.services.sse_manager import sse_manager

logger = structlog.get_logger()

async def check_client_churn_triggers(client_id: uuid.UUID, db: AsyncSession):
    """
    Proactive Churn Prediction Service (Workflow K).
    Checks for retention risks and alerts the coach via in-app/system alerts.
    """
    logger.info("checking_churn_triggers", client_id=str(client_id))
    
    # 1. CNS Fatigue Trigger
    # Query the 3 most recent DailyReadiness records for this client_id (ordered by logical_date descending, then created_at descending)
    readiness_query = (
        select(DailyReadiness)
        .where(DailyReadiness.athlete_id == client_id)
        .order_by(desc(DailyReadiness.logical_date), desc(DailyReadiness.created_at))
        .limit(3)
    )
    readiness_result = await db.execute(readiness_query)
    readiness_records = readiness_result.scalars().all()
    
    cns_warning_triggered = False
    if len(readiness_records) == 3:
        # Check if all 3 have energy_level <= 2 AND critical muscle soreness (muscle_soreness >= 4 or muscle_soreness <= 2)
        all_match = True
        for rec in readiness_records:
            energy_ok = rec.energy_level <= 2
            soreness_ok = (rec.muscle_soreness >= 4) or (rec.muscle_soreness <= 2)
            if not (energy_ok and soreness_ok):
                all_match = False
                break
        if all_match:
            cns_warning_triggered = True

    # 2. Inactivity Trigger
    # Query the latest WorkoutSession for this client_id
    workout_query = (
        select(WorkoutSession)
        .where(WorkoutSession.client_id == client_id)
        .order_by(desc(WorkoutSession.started_at))
        .limit(1)
    )
    workout_result = await db.execute(workout_query)
    latest_workout = workout_result.scalar_one_or_none()
    
    inactivity_warning_triggered = False
    now = datetime.utcnow()
    if latest_workout is None:
        inactivity_warning_triggered = True
    else:
        # If the latest workout session started_at date is >= 10 days ago (compared to datetime.utcnow())
        if latest_workout.started_at <= now - timedelta(days=10):
            inactivity_warning_triggered = True

    # If neither triggered, we can stop here
    if not (cns_warning_triggered or inactivity_warning_triggered):
        logger.info("no_churn_warnings_triggered", client_id=str(client_id))
        return

    # 3. Retrieve Client to get tenant_id and professional_id
    client_query = select(Client).where(Client.id == client_id)
    client_result = await db.execute(client_query)
    client_obj = client_result.scalar_one_or_none()
    if not client_obj:
        logger.error("client_not_found_for_churn_check", client_id=str(client_id))
        return

    tenant_id = client_obj.tenant_id
    professional_id = client_obj.professional_id
    
    # If professional_id is null, find a default/any professional in the tenant
    if not professional_id:
        pro_query = select(Professional).where(Professional.tenant_id == tenant_id).limit(1)
        pro_result = await db.execute(pro_query)
        pro_obj = pro_result.scalar_one_or_none()
        if not pro_obj:
            logger.error("no_professional_found_for_tenant_churn_alert", tenant_id=str(tenant_id))
            return
        professional_id = pro_obj.id

    # 4. Find or create a Conversation of type "GENERAL" matching professional_id, client_id, and tenant_id
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
        await db.flush() # Ensure we get conversation.id

    # 5. Process triggers
    today_start = datetime.combine(datetime.utcnow().date(), datetime.min.time())
    
    alerts_to_send = []
    if cns_warning_triggered:
        alerts_to_send.append({
            "signature": "[CNS Fatigue Warning]",
            "content": f"[CNS Fatigue Warning] El atleta {client_obj.first_name} {client_obj.last_name} está experimentando fatiga acumulada crítica del SNC (3 días consecutivos con energía baja y dolor muscular severo). Se sugiere revisar/ajustar su volumen de entrenamiento.",
            "intent_category": "training"
        })
    if inactivity_warning_triggered:
        last_workout_str = latest_workout.started_at.strftime("%Y-%m-%d") if latest_workout else "nunca"
        alerts_to_send.append({
            "signature": "[Inactivity Warning]",
            "content": f"[Inactivity Warning] Riesgo de abandono por inactividad: el atleta {client_obj.first_name} {client_obj.last_name} no registra entrenamientos en los últimos 10 días (último entrenamiento: {last_workout_str}). Se sugiere contactarlo.",
            "intent_category": "general"
        })

    for alert in alerts_to_send:
        # Check if already created today
        check_msg_query = (
            select(Message)
            .where(
                Message.conversation_id == conversation.id,
                Message.sender_type == "SYSTEM",
                Message.created_at >= today_start,
                Message.content.like(f"%{alert['signature']}%")
            )
            .limit(1)
        )
        check_result = await db.execute(check_msg_query)
        existing_warning = check_result.scalar_one_or_none()
        
        if existing_warning:
            logger.info("churn_alert_suppressed_by_antispam", signature=alert["signature"], client_id=str(client_id))
            continue
        
        # Save a new Message in the database
        new_message = Message(
            conversation_id=conversation.id,
            sender_id=client_id,
            sender_type="SYSTEM",
            content=alert["content"],
            intent_category=alert["intent_category"],
            is_read=False
        )
        db.add(new_message)
        await db.commit()
        await db.refresh(new_message)
        
        # SSE Broadcast
        message_payload_dict = {
            "id": str(new_message.id),
            "conversation_id": str(new_message.conversation_id),
            "sender_id": str(new_message.sender_id),
            "sender_type": new_message.sender_type,
            "content": new_message.content,
            "intent_category": new_message.intent_category,
            "is_read": new_message.is_read,
            "created_at": new_message.created_at.isoformat() if new_message.created_at else None
        }
        await sse_manager.broadcast_to_tenant(tenant_id, "NEW_INBOX_EVENT", message_payload_dict)
        logger.info("churn_alert_broadcasted", signature=alert["signature"], client_id=str(client_id))

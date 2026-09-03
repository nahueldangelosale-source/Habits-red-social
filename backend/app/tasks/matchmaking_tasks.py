import logging
import uuid
from typing import Any

from celery import shared_task
from sqlalchemy.orm import Session

from app.db.connection import sync_session_maker
from app.db.models import AthleteDraft, WorkoutPlan, Protocol, ProtocolType, Conversation, Message, Client
from app.services.openai_service import generate_ai_completion

logger = logging.getLogger(__name__)

def process_matchmaking_sync(draft_id: uuid.UUID):
    """
    Versión síncrona/background task del motor de Matchmaking y Swap Volumétrico.
    Si Celery está disponible, esto puede llamarse desde la task asíncrona.
    """
    db = sync_session_maker()
    try:
        draft = db.query(AthleteDraft).filter(AthleteDraft.id == draft_id).first()
        if not draft:
            logger.error(f"Draft {draft_id} no encontrado")
            return

        # 1. MATCHMAKING SIMULADO (Buscar la Plantilla Maestra que mejor encaje)
        # En producción real, haríamos búsqueda vectorial con pgvector buscando
        # protocolos "routine" master del tenant.
        # Por simplicidad de MVP, buscamos CUALQUIER plan activo del tenant o creamos uno fake
        master_plan = db.query(WorkoutPlan).filter(
            WorkoutPlan.tenant_id == draft.tenant_id,
            WorkoutPlan.is_master == True
        ).first()

        master_plan_id = master_plan.id if master_plan else None
        
        # 2. DEFINIR EL PROMPT PARA EL SWAP ENGINE (LLM)
        onboarding = draft.onboarding_data
        
        system_prompt = f"""
Eres un Swap Engine Volumétrico de Élite (AI Master Coach).
Tienes que adaptar un programa de entrenamiento según estos parámetros de Onboarding:

ATLETA:
- Días disponibles: {onboarding.get('days')}
- Equipo: {onboarding.get('equipment')}
- Lesiones: {onboarding.get('injuries')}
- Nivel de Estrés (1-10): {onboarding.get('stressLevel')}
- Estilo: {onboarding.get('coachingStyle')}

REGLA CLAVE Y ESTRICTA DE MRV (Maximum Recoverable Volume):
Si el Nivel de Estrés es mayor a 8, DEBES reducir las series de los ejercicios compuestos en 1 o 2 series para proteger el sistema nervioso del atleta.

FORMATO DE SALIDA ESTRICTO JSON:
{{
  "mutated_routine": {{
    // La rutina adaptada... (estructura arbitraria para UI B2B)
    "days": [
        {{ "name": "Día 1", "exercises": [ {{"name": "Sentadilla Búlgara", "sets": 3, "reps": "10-12"}} ] }}
    ]
  }},
  "risk_score": "Yellow", // Green, Yellow, Red basado en lesiones y estrés
  "ai_reasoning": [
    {{"target": "General", "reason": "Reducción de series globales porque estrés es 9/10."}},
    {{"target": "Sentadilla Búlgara", "reason": "Cambiado de Sentadilla Libre porque solo tiene mancuernas."}}
  ]
}}
        """

        # 3. LLAMAR A LITELLM (via nuestro openai_service)
        fallback_json = {
            "mutated_routine": {
                 "days": [{"name": "Día 1 Adaptado", "exercises": [{"name": "Goblet Squat (Fallback)", "sets": 3, "reps": "15"}]}]
            },
            "risk_score": "Yellow",
            "ai_reasoning": [{"target": "Fallback", "reason": "Simulación AI por defecto. Estrés alto detectado."}]
        }

        try:
            # Asumimos que generate_ai_completion maneja el parseo a JSON
            ai_result = generate_ai_completion(
                system_prompt=system_prompt,
                user_prompt="Genera el JSON final adaptado.",
                response_format={"type": "json_object"}
            )
            # asumiendo que generate_ai_completion devuelve el dict si response_format es json
            import json
            if isinstance(ai_result, str):
                parsed_result = json.loads(ai_result)
            else:
                 parsed_result = ai_result
                 
        except Exception as e:
            logger.error(f"Error llamando a LLM, usando fallback: {e}")
            parsed_result = fallback_json

        # 4. GUARDAR RESULTADOS EN DB
        draft.original_plan_id = master_plan_id
        draft.mutated_routine = parsed_result.get("mutated_routine", fallback_json["mutated_routine"])
        draft.ai_reasoning = parsed_result.get("ai_reasoning", fallback_json["ai_reasoning"])
        draft.risk_score = parsed_result.get("risk_score", "Yellow")
        
        # 5. NOTIFICAR AL COACH VIA SSE (Real-time Inbox Update)
        try:
            from app.services.sse_manager import sse_manager
            
            # Buscamos o creamos la conversación para este Draft para que aparezca en el Inbox
            conv = db.query(Conversation).filter(
                Conversation.client_id == draft.client_id,
                Conversation.entity_type == 'WORKOUT',
                Conversation.entity_id == draft.id
            ).first()
            
            if not conv:
                client = db.query(Client).filter(Client.id == draft.client_id).first()
                conv = Conversation(
                    tenant_id=draft.tenant_id,
                    client_id=draft.client_id,
                    professional_id=client.professional_id if client else None,
                    entity_type='WORKOUT',
                    entity_id=draft.id
                )
                db.add(conv)
                db.flush()

            # Mensaje de sistema/IA que aparece en el Inbox
            new_msg = Message(
                conversation_id=conv.id,
                sender_id=draft.id, # O un UUID de sistema
                sender_type='SYSTEM',
                content=f"Draft de Rutina Generado: {draft.risk_score} Risk",
                intent_category='training',
                is_read=False
            )
            db.add(new_msg)
            db.commit()

            # Emitir evento SSE
            from app.db.models import Client
            client = db.query(Client).filter(Client.id == draft.client_id).first()
            
            event_data = {
                "type": "NEW_CONVERSATION",
                "payload": {
                    "id": str(conv.id),
                    "clientName": f"{client.first_name} {client.last_name}" if client else "Nuevo Atleta",
                    "lastMessage": new_msg.content,
                    "lastMessageTime": new_msg.created_at.isoformat(),
                    "unreadCount": 1,
                    "category": "training",
                    "entity_type": "WORKOUT"
                }
            }
            sse_manager.broadcast(draft.tenant_id, event_data)
            logger.info(f"SSE Broadcast sent for draft {draft.id}")

        except Exception as e:
            logger.error(f"Failed to send SSE broadcast: {e}")
            db.rollback()

    except Exception as e:
        logger.error(f"Matchmaking AI Task failed: {e}")
        db.rollback()
    finally:
        db.close()


@shared_task(name="matchmaking_ai_worker")
def matchmaking_ai_task(draft_id: str):
    """Celery entrypoint for the matchmaking background task."""
    process_matchmaking_sync(uuid.UUID(draft_id))

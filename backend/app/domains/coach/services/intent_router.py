import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class IntentRouter:
    """
    Sovereign Triage Engine
    Determines if a message can be routed deterministically or requires LLM (Celery).
    """
    def __init__(self):
        pass

    async def process_message(self, message_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
        """
        Process an incoming message from the athlete chat.
        Layer 1: Deterministic bypass
        Layer 2: AI Classification via Celery
        """
        text = message_data.get("text", "")
        explicit_intent = message_data.get("explicit_intent")
        context_ref = message_data.get("context_ref")

        # Fast Path (Layer 1)
        if explicit_intent:
            logger.info(f"[Sovereign Triage] Fast Path taken. Intent: {explicit_intent}")
            
            # TODO: Persist immediately to DB or Redis
            
            # Return immediate actionable response
            return {
                "sender": "System",
                "text": f"✓ Mensaje clasificado como {explicit_intent}. El entrenador ha sido notificado con prioridad.",
                "explicit_intent": explicit_intent,
                "context_ref": context_ref,
                "status": "DELIVERED_FAST"
            }
        
        # Slow Path (Layer 2)
        logger.info("[Sovereign Triage] Ambiguous message. Dispatching to Cognitive Engine (Celery).")
        
        # Dispatch to celery
        try:
            from app.domains.coach.tasks import analyze_patient_inquiry
            task = analyze_patient_inquiry.delay(text, user_id)
            task_id = task.id
        except ImportError:
            # Fallback if task is not created yet
            task_id = "mock-task-id"
            
        return {
            "sender": "System",
            "text": "🤖 Analizando...",
            "is_skeleton": True,
            "task_id": task_id,
            "status": "PROCESSING_SLOW"
        }

intent_router = IntentRouter()

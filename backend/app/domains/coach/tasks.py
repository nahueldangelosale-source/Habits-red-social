import time
import json
from app.celery_app import celery_app
import structlog

logger = structlog.get_logger()

@celery_app.task(bind=True, name="coach.generate_hypertrophy_progression")
def generate_hypertrophy_progression_task(self, athlete_data: dict) -> dict:
    """
    Tarea pesada asíncrona que simula la simulación del LLM para el cálculo de hipertrofia.
    """
    logger.info("generate_hypertrophy_started", task_id=self.request.id, athlete_data=athlete_data)
    
    # Simula el retardo comunicacional con el modelo de LLM o el procesamiento de datos
    time.sleep(5)
    
    result = {
        "status": "SUCCESS",
        "result": {
            "rationale": f"Adaptación biomecánica finalizada para áreas: {', '.join(athlete_data.get('medicalTags', []))}.",
            "exercises": [
                {
                    "id": "ex_1",
                    "order": 1,
                    "sets": 4,
                    "reps": "8-10",
                    "weight": 0,
                    "exercise": {
                        "id": "ex_1_base",
                        "name": "Sentadilla Trasera (Adaptada)",
                        "name_es": "Sentadilla Trasera (Adaptada)"
                    },
                    "isAiSwapped": True,
                    "clinicalContext": "Reducción de carga axial por restricción médica."
                },
                {
                    "id": "ex_2",
                    "order": 2,
                    "sets": 3,
                    "reps": "12-15",
                    "weight": 0,
                    "exercise": {
                        "id": "ex_2_base",
                        "name": "Prensa de Piernas 45",
                        "name_es": "Prensa de Piernas 45"
                    },
                    "isAiSwapped": True,
                    "clinicalContext": "Soporte lumbar garantizado."
                }
            ],
            "metadata": {
                "model": "celery-autopilot-1.0",
                "input_tokens": 0,
                "output_tokens": 0
            }
        }
    }
    
    logger.info("generate_hypertrophy_completed", task_id=self.request.id)
    return result

@celery_app.task(bind=True, name="coach.analyze_patient_inquiry")
def analyze_patient_inquiry(self, text: str, user_id: int) -> dict:
    """
    Simulates Gemini Inference (Layer 2) for ambiguous intents in Sovereign Triage.
    """
    logger.info("analyze_patient_inquiry_started", task_id=self.request.id, user_id=user_id, text=text)

    # Simula el retardo computacional con Gemini
    time.sleep(5)

    # Simplified mock logic for classification
    text_lower = text.lower()
    intent = "GENERAL"
    if "dolor" in text_lower or "duele" in text_lower:
        intent = "PAIN"
    elif "tecnica" in text_lower or "ejecucion" in text_lower or "como se hace" in text_lower:
        intent = "TECHNIQUE"
    elif "dieta" in text_lower or "comida" in text_lower or "nutricion" in text_lower:
        intent = "NUTRITION"
    elif "pago" in text_lower or "tarjeta" in text_lower or "suscripcion" in text_lower:
        intent = "BILLING"

    # GRAPH-RAG: Inyección Dinámica de Contexto (Skill Mapping)
    skill_manifest_map = {
        "NUTRITION": {
             "skill_name": "clinical-nutrition",
             "knowledge_silo": "02_nutricion/",
             "metadata_tags": ["macros", "TMB", "mifflin-st-jeor", "recomp"]
        },
        "TECHNIQUE": {
             "skill_name": "fitness-instructor",
             "knowledge_silo": "01_pt_gym/",
             "metadata_tags": ["hipertrofia", "biomecanica", "RPE", "RIR", "junk-volume"]
        },
        "PAIN": {
             "skill_name": "engineering-ai", # Redirigido a triage clínico / Hard Constraints
             "knowledge_silo": "00_ingenieria_ia/",
             "metadata_tags": ["system-guardrails", "zero-trust", "clinical-triage"]
        },
        "GENERAL": {
             "skill_name": "mind-psychology",
             "knowledge_silo": "03_mind/",
             "metadata_tags": ["neuroesthetic", "adherence", "flow-state", "cognitive-load"]
        }
    }

    injected_context = skill_manifest_map.get(intent, skill_manifest_map["GENERAL"])
    logger.info("graph_rag_context_injected", skill=injected_context["skill_name"], tags=injected_context["metadata_tags"])

    result = {
        "status": "SUCCESS",
        "result": {
            "explicit_intent": intent,
            "confidence": 0.89,
            "rationale": f"Clasificado como {intent} basado en análisis semántico.",
            "original_text": text,
            "injected_skill": injected_context["skill_name"],
            "graph_rag_metadata": {
                "silo_path": f"docs/business_context/{injected_context['knowledge_silo']}",
                "vector_tags": injected_context["metadata_tags"],
                "progressive_disclosure_active": True
            }
        }
    }

    logger.info("analyze_patient_inquiry_completed", task_id=self.request.id, intent=intent, skill=injected_context["skill_name"])
    return result

@celery_app.task(bind=True, name="coach.propose_macrocycle_draft")
def propose_macrocycle_draft(self, patient_tags: list, coach_id: str, client_id: str) -> dict:
    """
    CELERY TASK (LLM DRAFT GENERATOR)
    Genera un JSON estricto Zod con una propuesta de entrenamiento periodizado (hasta 52 semanas).
    Status estricto: PENDING_APPROVAL.
    """
    logger.info("propose_macrocycle_draft_started", task_id=self.request.id, patient_tags=patient_tags, coach=coach_id, client=client_id)

    import time
    import uuid
    import datetime
    from app.services.redis_pubsub import redis_client
    import json

    # Simulate some background processing work for Labor Illusion
    time.sleep(2) # biomechanics
    time.sleep(2) # progression
    time.sleep(1) # compilation

    # Generate dynamic weeks
    total_weeks = 4
    weeks_dict = {}
    
    # Safe fallback core exercises
    core_exercises = [
        {"id": "ex-1", "name": "Sentadilla Goblet", "biomechanical_tags": ["anti_extension", "knee_dominant"]},
        {"id": "ex-2", "name": "Press de Banca con Mancuernas", "biomechanical_tags": ["horizontal_push", "chest"]},
        {"id": "ex-3", "name": "Remo con Mancuerna", "biomechanical_tags": ["horizontal_pull", "back"]},
    ]

    for w in range(1, total_weeks + 1):
        is_deload = w % 4 == 0
        rpe_base = 7 + (w - 1) if not is_deload else 6
        sets_base = 3 + (1 if w == 3 else 0) if not is_deload else 2
        
        days_dict = {}
        for d in range(1, 4):  # 3 days a week
            blocks = []
            exercises = []
            for ex in core_exercises:
                exercises.append({
                    "id": str(uuid.uuid4()),
                    "name": ex["name"],
                    "sets": sets_base,
                    "reps": "8-12" if not is_deload else "12-15",
                    "weight": 0,
                    "rpe": rpe_base,
                    "execution_cues": ["Mantener forma estricta"],
                    "biomechanical_tags": ex["biomechanical_tags"]
                })
            
            blocks.append({
                "type": "STRENGTH",
                "exercises": exercises
            })
            
            days_dict[f"day_{d}"] = {
                "name": f"Full Body {['A', 'B', 'C'][d-1]}",
                "blocks": blocks
            }
            
        weeks_dict[f"week_{w}"] = {
            "focus": "Deload" if is_deload else f"Intensificación Sem. {w}",
            "days": days_dict
        }

    macrocycle_id = str(uuid.uuid4())
    generated_macrocycle = {
        "id": macrocycle_id,
        "name": f"Fase Generada IA (4 Semanas)",
        "target_tags": patient_tags,
        "structure": weeks_dict,
        "status": "PENDING_APPROVAL",
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    result = {
        "status": "COMPLETED",
        "result": generated_macrocycle
    }

    # Emit SSE / PubSub result
    try:
        redis_client.publish(f"task_status:{self.request.id}", json.dumps(result))
    except Exception as e:
        logger.warning(f"Failed to publish to redis: {e}")

    logger.info("propose_macrocycle_draft_completed", task_id=self.request.id, macrocycle_id=macrocycle_id)
    return result

@celery_app.task(bind=True, name="coach.apply_protocol_rebase")
def apply_protocol_rebase(self, protocol_id: str, new_protocol_state: dict, original_hash: str) -> dict:
    """
    CELERY TASK (Diff Engine / Rebase Pattern)
    Fast-forwards exact clones of an ActiveWorkoutPlan, and emits MERGE_CONFLICT_DETECTED
    for plans that have hot mutations (different state_hash).
    """
    from app.db.connection import engine
    from sqlalchemy import text
    from app.services.redis_pubsub import redis_client
    import asyncio
    import json
    import hashlib

    logger.info("apply_protocol_rebase_started", protocol_id=protocol_id)

    async def execute_rebase():
        # Calculate new hash
        new_content_str = json.dumps(new_protocol_state, sort_keys=True)
        new_state_hash = hashlib.sha256(new_content_str.encode('utf-8')).hexdigest()

        fast_forward_count = 0
        conflict_count = 0
        affected_athletes_conflicts = []

        async with engine.connect() as conn:
            # 1. Fast-Forward: Update exact matches
            update_stmt = text("""
                UPDATE active_workout_plans
                SET content = :new_content, state_hash = :new_hash, updated_at = NOW()
                WHERE origin_protocol_id = :protocol_id AND state_hash = :original_hash
                RETURNING client_id
            """)
            result_update = await conn.execute(update_stmt, {
                "new_content": json.dumps(new_protocol_state),
                "new_hash": new_state_hash,
                "protocol_id": protocol_id,
                "original_hash": original_hash
            })
            fast_forward_count = len(result_update.fetchall())
            
            # 2. Conflicts: Find hot mutated plans
            conflict_stmt = text("""
                UPDATE active_workout_plans
                SET status = 'CONFLICT_PENDING', conflict_detected_at = NOW(), updated_at = NOW()
                WHERE origin_protocol_id = :protocol_id AND state_hash != :original_hash
                RETURNING client_id, tenant_id
            """)
            result_conflict = await conn.execute(conflict_stmt, {
                "protocol_id": protocol_id,
                "original_hash": original_hash
            })
            conflicts = result_conflict.fetchall()
            
            await conn.commit()

            # Emit Redis Event for Conflicts
            for c_client_id, tenant_id in conflicts:
                conflict_count += 1
                affected_athletes_conflicts.append(str(c_client_id))
                
                # Emitir evento por WebSockets vía Redis Pub/Sub
                channel = f"tenant:{tenant_id}:notifications"
                payload = {
                    "event": "MERGE_CONFLICT_DETECTED",
                    "origin_protocol_id": protocol_id,
                    "client_id": str(c_client_id)
                }
                # Asegurar compatibilidad asíncrona si redis_client lo soporta
                # Asumimos que redis_client tiene un publish o lo encolamos sincrónicamente
                try:
                    # Depending on how redis_client is implemented, it might be sync or async
                    await redis_client.publish(channel, json.dumps(payload))
                except Exception as e:
                    logger.error("redis_publish_error", error=str(e), channel=channel)

        return {
            "status": "SUCCESS",
            "fast_forward_updates": fast_forward_count,
            "conflicts_detected": conflict_count,
            "conflicts_athletes": affected_athletes_conflicts
        }

    # Run the async logic in a new event loop for this Celery worker thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(execute_rebase())
    finally:
        loop.close()

    logger.info("apply_protocol_rebase_completed", protocol_id=protocol_id, result=result)
    return result

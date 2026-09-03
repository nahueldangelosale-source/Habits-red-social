import os
import json
import structlog
from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from litellm import completion
from tenacity import retry, stop_after_attempt, wait_exponential

from app.db.connection import async_session_maker
from app.db.models import WorkoutPlan

logger = structlog.get_logger()

# ⚠️ Entorno Real: Usar `@celery_app.task(bind=True, max_retries=3)` 
# y llamar funciones sincrónicas o correr loop interno.
# Simularemos Celery para este scope aislando la inyección.

# =============================================================================
# SYSTEM PROMPTS (Chapter 4 - Autonomic De-load Protocol)
# =============================================================================

# Prompt estándar: Fatiga energética (energy <= 2)
STANDARD_MUTATION_PROMPT = (
    "Eres el Motor de Mutación Proactiva de AUREA. "
    "El atleta reportó fatiga crítica del SNC (energía <= 2). "
    "Analiza el siguiente JSON de rutina. Si la rutina demanda Alto Impacto / Carga Axial "
    "(ej. Peso Muerto al 90%, Sentadillas Libres pesadas), reemplaza esos ejercicios específicos "
    "por alternativas aisladas de menor impacto sistémico (ej. Leg Curl, Prensa) e intenta bajar "
    "el RPE (Rate of Perceived Exertion) a 7. "
    "NO alteres ejercicios que ya sean de hipertrofia analítica. "
    "Devuelve ESTRICTAMENTE UN JSON con la matriz alterada. Cero explicaciones textuales."
)

# Prompt de Restauración NQ: Red Flags neurobiológicas (estrés > 8 o sueño < 5h)
AUTONOMIC_DELOAD_PROMPT = (
    "Eres el Motor de Protección Autonómica de AUREA. "
    "ALERTA CRÍTICA: El atleta presenta banderas rojas neurobiológicas "
    "(estrés crónico severo > 8/10 y/o privación de sueño < 5 horas). "
    "Su sistema nervioso autónomo requiere RESTAURACIÓN INMEDIATA. "
    "\n\n"
    "PROTOCOLO DE DESCARGA AUTONÓMICA (Restauración NQ):\n"
    "1. REEMPLAZA COMPLETAMENTE todos los ejercicios de fuerza, hipertrofia y alto impacto.\n"
    "2. La sesión DEBE consistir ÚNICAMENTE en:\n"
    "   - Movilidad articular (Foam Rolling, Stretching Dinámico)\n"
    "   - Estiramientos pasivos (15-30 segundos por grupo muscular)\n"
    "   - Caminata ligera (10-20 minutos RPE 3-4)\n"
    "   - Respiración diafragmática / Box Breathing (4-7-8)\n"
    "3. RPE máximo permitido: 4\n"
    "4. Duración total: 20-30 minutos\n"
    "\n"
    "Devuelve ESTRICTAMENTE UN JSON con la rutina de Restauración NQ. "
    "Cero explicaciones textuales."
)

# Mensaje empático para la descripción de la rutina mutada
EMPATHIC_TONE_STANDARD = (
    "\n\n🧠 Tu cuerpo nos indica fatiga hoy. Hemos ajustado tu rutina "
    "para proteger tu sistema nervioso y optimizar tu recuperación. "
    "Recuerda: descansar bien es entrenar inteligente."
)

EMPATHIC_TONE_AUTONOMIC_DELOAD = (
    "\n\n💜 Tu bienestar es nuestra prioridad. Detectamos señales de "
    "estrés elevado o falta de descanso. Hoy no es día de empujar límites, "
    "es día de cuidarte. Hemos preparado una sesión de Restauración NQ "
    "(movilidad y respiración) diseñada para proteger tu sistema nervioso "
    "central y ayudarte a recuperar el equilibrio. "
    "El descanso activo es tu mejor aliado. 🌱"
)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=6))
def _run_litellm_mutation_sync(routine_json: dict, is_autonomic_deload: bool = False) -> dict:
    """ 
    Wrapper síncrono para Tenacity y LiteLLM.
    Reglas: Si falla 3 veces por Timeout/Cuota, arroja excepción manejada por Celery.
    
    Chapter 4: Selecciona el prompt según el tipo de alerta:
    - Standard: energy <= 2 → reduce carga e impacto
    - Autonomic De-load: Red Flags → Restauración NQ completa
    """
    system_prompt = AUTONOMIC_DELOAD_PROMPT if is_autonomic_deload else STANDARD_MUTATION_PROMPT
    
    response = completion(
        model=os.getenv("LITELLM_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(routine_json)}
        ],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

async def evaluate_routine_safety_task(athlete_id_str: str, is_autonomic_deload: bool = False):
    """
    Celery Worker (Workflow K - Fase 24)
    ------------------------------------
    Es disparado condicionalmente por `/readiness` si el check-in reporta rojo/amarillo severo.
    1. Trae la rutina original del Atleta (WorkInProgress).
    2. Delega a LiteLLM la mutación clínica.
    3. Si LiteLLM colapsa, falla en silencio para no bloquear la rutina base. Alerta al Coach.
    
    Chapter 4: Si is_autonomic_deload=True, aplica el Protocolo de Descarga
    Autonómica (Restauración NQ) con tono empático compasivo.
    """
    athlete_id = UUID(athlete_id_str)
    mutation_type = "autonomic_deload" if is_autonomic_deload else "standard"
    logger.info("proactive_mutation_started", athlete_id=str(athlete_id), type=mutation_type)
    
    async with async_session_maker() as session:
        # 1. Recuperar rutina actual. En AUREA esto es el Master Plan derivado para hoy.
        # Simularemos una query buscando el plan más reciente del athlete
        res = await session.execute(
            select(WorkoutPlan)
            .where(WorkoutPlan.client_id == athlete_id)
            .order_by(WorkoutPlan.created_at.desc())
            .limit(1)
        )
        routine = res.scalars().first()
        
        if not routine:
            logger.warning("proactive_mutation_aborted_no_routine", athlete_id=str(athlete_id))
            return
            
        routine_metadata = routine.metadata_dict if getattr(routine, 'metadata_dict', None) else {}
        
        # Fallback Mock para demostración local si JSON está vacío
        if not routine_metadata:
            routine_metadata = {
                "day_name": "Fuerza Axial",
                "exercises": [
                    {"name": "Peso Muerto", "target_rpe": 9, "reps": 5},
                    {"name": "Sentadilla Búlgara", "target_rpe": 8, "reps": 10}
                ]
            }

        try:
            # 2. Mutación de Inteligencia Artificial
            logger.debug(
                "proactive_mutation_triggering_llm",
                input_exercises=len(routine_metadata.get('exercises', [])),
                is_autonomic_deload=is_autonomic_deload,
            )
            
            mutated_json = _run_litellm_mutation_sync(routine_metadata, is_autonomic_deload)
            
            # 3. Deltas Clínicos
            # Aplicamos el JSON regenerado
            routine.metadata_dict = mutated_json
            
            # Chapter 4: Empathic Tone Generator
            if is_autonomic_deload:
                # Tono empático compasivo para Red Flags
                audit_trail = "🛡️ RESTAURACIÓN NQ ACTIVADA (Descarga Autonómica)"
                empathic_msg = EMPATHIC_TONE_AUTONOMIC_DELOAD
            else:
                # Tono empático estándar para fatiga
                audit_trail = "⚠️ RUTINA MUTADA POR COPILOTO (Alerta SNC)"
                empathic_msg = EMPATHIC_TONE_STANDARD
            
            routine.description = (routine.description or "") + f"\n\n{audit_trail}{empathic_msg}"
            
            await session.commit()
            logger.info(
                "proactive_mutation_success",
                athlete_id=str(athlete_id),
                routine_id=str(routine.id),
                mutation_type=mutation_type,
            )
            
            # (Futuro) SSE Dispatcher: Notificar al UI B2C que recargue 
            # await redis_client.publish(f"b2c_{athlete_id}", 'MUTATION_READY')
            
        except Exception as e:
            # 🛡️ FALLBACK SILENCIOSO B2C
            logger.error("proactive_mutation_failed_fallback", error=str(e), athlete_id=str(athlete_id))
            # La rutina queda intacta en base de datos.
            # Dispacha SSE Critical al The Watchtower del Coach:
            # redis_client.publish(f"coach_critical_alerts", f"Atleta {athlete_id} rebotó la red neuronal. Evalué manualmente.") 
            pass

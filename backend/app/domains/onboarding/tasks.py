import time
from celery import shared_task
import structlog
from pydantic import BaseModel, Field
from typing import List, Optional
from opentelemetry import trace
from app.celery_app import celery_app
from app.db.connection import sync_session_maker
from app.db.models import Exercise, TrainingArchetype
from pathlib import Path

logger = structlog.get_logger()
tracer = trace.get_tracer(__name__)

# Structured Outputs / Grammar Constrained Decoding Contract
class ExerciseConfig(BaseModel):
    name: str = Field(..., description="Nombre técnico del ejercicio")
    sets: int = Field(..., description="Número de series")
    reps: str = Field(..., description="Rango de repeticiones (ej. 8-10)")
    biomechanical_safe: bool = Field(..., description="Confirmación determinista de seguridad articular para este atleta")
    notes: Optional[str] = Field(None, description="Coaching cues específicas para la restricción clínica")

class SessionConfig(BaseModel):
    day: str = Field(..., description="Día del ciclo o semana")
    focus: str = Field(..., description="Enfoque de la sesión (ej. Empuje, Tracción, Metabólico)")
    exercises: List[ExerciseConfig] = Field(..., description="Lista de prescripciones de ejercicios")

class MacrocycleResponse(BaseModel):
    weeks: int = Field(..., description="Duración en semanas")
    estimated_daily_calories: int = Field(..., description="Estimación de calorías de mantenimiento TMB")
    core_restrictions: List[str] = Field(..., description="Resumen de restricciones duras identificadas (clínicas/biométricas)")
    sessions: List[SessionConfig] = Field(..., description="Estructura de entrenamiento prescrita")

@celery_app.task(bind=True, max_retries=3, name="onboarding.process_pipeline")
def process_onboarding_pipeline(self, payload: dict) -> dict:
    """
    Nutrium Killer Worker: Inferencia LLM estructurada y observabilidad GenAI.
    Extrae Hard Constraints y orquesta una simulación LLM-as-a-Judge.
    """
    with tracer.start_as_current_span("onboarding_processing") as span:
        # Registrar Semántica OTel
        span.set_attribute("gen_ai.system", "nutrium_killer_v1")
        span.set_attribute("gen_ai.request.model", "gpt-4o-structured")
        span.set_attribute("gen_ai.task_id", self.request.id)
        
        # Extracción de Constraints Duros
        biometric_tags = payload.get("biometric_tags", [])
        clinical_tags = payload.get("nut_clinical_tags", [])
        hard_constraints = biometric_tags + clinical_tags
        
        span.set_attribute("gen_ai.hard_constraints.count", len(hard_constraints))

        # ==========================================
        # FASE 1: CLASIFICACIÓN DE INTENCIÓN (ARCHETYPES)
        # ==========================================
        db = sync_session_maker()
        try:
            archetypes = db.query(TrainingArchetype).all()
            
            # Simulated LLM classification logic (Phase 1)
            span.add_event("Phase 1: LLM Archetype Classification", attributes={
                "prompt.archetypes_count": len(archetypes)
            })
            time.sleep(1) # simulate networking
            
            # Mock LLM decision:
            selected_archetype_id = "ARQ_02_UPPER_LOWER"
            span.set_attribute("gen_ai.phase1.selected_archetype_id", selected_archetype_id)
            
            selected_archetype = next((a for a in archetypes if a.id == selected_archetype_id), archetypes[0])
            
            archetype_context = (
                f"ARQUETIPO BASE SELECCIONADO: {selected_archetype.id} - {selected_archetype.name}\n"
                f"Días: {selected_archetype.days_per_week_min}-{selected_archetype.days_per_week_max}\n"
                f"Objetivo: {selected_archetype.primary_goal}\n"
                f"Perfil: {selected_archetype.psychographic_profile}"
            )
        
            # ==========================================
            # FASE 2: GRAPH-RAG PRUNING BIOMECÁNICO
            # ==========================================
            allowed_exercises = []
            all_exercises = db.query(Exercise).all()
            for ex in all_exercises:
                # Si CUALQUIERA de los hard constraints está en las contraindicaciones, se ignora
                if not any(constraint in ex.contraindications for constraint in hard_constraints):
                    allowed_exercises.append(f"{ex.exercise_id}: {ex.official_name} ({ex.mechanic})")
                    
            span.set_attribute("gen_ai.pruning.allowed", len(allowed_exercises))
            span.set_attribute("gen_ai.pruning.total", len(all_exercises))
        finally:
            db.close()
            
        # Cargar Biomechanics Agent Skill (System Prompt extension)
        skill_path = Path(__file__).resolve().parent.parent.parent.parent.parent / ".agents" / "skills" / "biomechanics_expert" / "SKILL.md"
        skill_context = skill_path.read_text(encoding="utf-8") if skill_path.exists() else ""

        logger.info(
            "nutrium_killer_worker_started", 
            task_id=self.request.id, 
            constraints=hard_constraints
        )

        try:
            # Add an event reflecting the prompt payload logic
            span.add_event("Phase 2: Dispatching structured prompt to LLM", attributes={
                "prompt.constraints": str(hard_constraints),
                "prompt.allowed_pool_size": len(allowed_exercises),
                "prompt.selected_archetype": selected_archetype.id
            })

            # Generar el Prompt Híbrido: Skill Core + Archetype + Vectorial/SQL Pruning
            system_prompt = f"""
            {skill_context}
            
            == TEMPLATE-ANCHORED GENERATION ==
            {archetype_context}
            
            == KINETIC GRAPH-RAG REGLAS DE PODADO ==
            EL ATLETA POSEE LAS SIGUIENTES RESTRICCIONES DURAS: {hard_constraints}
            SE HA PODADO EL CATÁLOGO. SOLO PUEDES USAR LOS SIGUIENTES IDs DE EJERCICIO:
            {', '.join(allowed_exercises[:100])}
            """

            # Simular inferencia LLM con Network I/O (Exponential Backoff en prod)
            time.sleep(3)

            # Mock Structured GCD Output (Obligatory Pydantic conformance)
            mock_llm_json = {
                "weeks": 12,
                "estimated_daily_calories": 2300,
                "core_restrictions": hard_constraints if hard_constraints else ["None"],
                "sessions": [
                    {
                        "day": "Day 1",
                        "focus": "Full Body Adaptive",
                        "exercises": [
                            {
                                "name": "Kettlebell Deadbug",
                                "sets": 3,
                                "reps": "12/side",
                                "biomechanical_safe": True,
                                "notes": "Mantener core estabilizado"
                            }
                        ]
                    }
                ]
            }
            
            # Pydantic Structural Validation of the Output
            validated_output = MacrocycleResponse(**mock_llm_json)

            span.add_event("Structured LLM Response Parsed successfully", attributes={
                "gen_ai.response.total_sessions": len(validated_output.sessions)
            })

            # TODO: Mutate athlete's state to ONBOARDING_COMPLETED in DB here
            # For now we acknowledge the result.
            
            logger.info("nutrium_killer_worker_completed", task_id=self.request.id, archetype=selected_archetype.id)
            
            return {
                "status": "SUCCESS",
                "athlete_status": "ONBOARDING_COMPLETED",
                "archetype_selected": selected_archetype.id,
                "macrocycle": validated_output.model_dump()
            }
            
        except Exception as e:
            span.record_exception(e)
            span.set_attribute("error", True)
            logger.error("nutrium_killer_worker_failed", task_id=self.request.id, exc_info=e)
            
            # Exponential backoff trigger
            try:
                self.retry(countdown=2 ** self.request.retries)
            except self.MaxRetriesExceededError:
                return {"status": "FAILED", "reason": "Max retries exceeded"}

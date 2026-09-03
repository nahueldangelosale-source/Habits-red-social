from __future__ import annotations

"""
Fitness Intelligence Service - "Sovereign Swap Engine"
Deterministic Replacement Engine for exercise substitution.

Governance Rules:
1. Skill Differential: Max gap of 1.
2. Impact Mitigation: Never suggest an alternate with higher joint impact.
3. Axial Load (McGill Protocol): Filter if back pain is present.
4. Biomechanical Equivalence: Must share the same Movement Pattern.
"""

from typing import Optional, List
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Exercise as DBExercise, ExerciseTarget

# =============================================================================
# SCHEMAS (Validated for Rule Engine)
# =============================================================================

class ExerciseSchema(BaseModel):
    id: UUID
    official_name: str
    movement_pattern: str
    laterality: str
    axial_load: bool
    primary_muscle: str
    skill_level: int
    joint_impact: str
    equipment_required: List[str]
    
    model_config = ConfigDict(from_attributes=True)

class ReplacementResponse(BaseModel):
    original: ExerciseSchema
    replacement: ExerciseSchema
    reason: str
    muscle_preservation_pct: float = 90.0
    notes: Optional[str] = None

# =============================================================================
# SERVICE
# =============================================================================

class FitnessIntelligenceService:
    """
    Servicio de inteligencia para fitness (Swap Engine).
    Implementa reglas de gobernanza biomecánica deterministas.
    """
    
    async def get_exercise(self, db: AsyncSession, exercise_id: UUID) -> Optional[DBExercise]:
        """Obtiene ejercicio por ID desde la DB."""
        return await db.get(DBExercise, exercise_id)
    
    async def find_replacement(
        self,
        db: AsyncSession,
        exercise_id: UUID,
        reason: str,
        available_equipment: Optional[List[str]] = None,
        athlete_back_pain: bool = False
    ) -> Optional[ReplacementResponse]:
        """
        [SWAP ENGINE] Encuentra reemplazo algorítmico basado en Gobernanza Biomecánica.
        """
        original = await self.get_exercise(db, exercise_id)
        if not original:
            return None

        # 1. Buscar alternativas en el mismo Patrón de Movimiento
        stmt = select(DBExercise).where(
            DBExercise.movement_pattern == original.movement_pattern,
            DBExercise.id != original.id
        )
        result = await db.execute(stmt)
        candidates = result.scalars().all()

        reason_lower = reason.lower()
        
        # 1. Detect if it's a skill regression request
        is_skill_regression = any(
            kw in reason_lower 
            for kw in ["habilidad", "dificultad", "muy dificil", "muy difícil", "no me sale", "técnica", "tecnica", "skill", "difficulty", "regression", "regresión"]
        )
        
        # 2. Detect if it's an equipment deficiency request
        is_equipment_deficiency = any(
            kw in reason_lower 
            for kw in ["equipo", "equipamiento", "no tengo", "sin barra", "sin mancuerna", "sin máquina", "no hay", "missing", "missing_equipment", "equipment"]
        ) or (available_equipment is not None)
        
        # Determine dynamic equipment exclusions based on text
        exclude_equipment_keywords = []
        if any(kw in reason_lower for kw in ["sin barra", "no tengo barra", "no hay barra", "no barra", "barra"]):
            exclude_equipment_keywords.append("barra")
        if any(kw in reason_lower for kw in ["sin mancuerna", "no tengo mancuerna", "no hay mancuerna"]):
            exclude_equipment_keywords.append("mancuerna")
        if any(kw in reason_lower for kw in ["sin máquina", "no tengo máquina", "no hay máquina", "sin maquina"]):
            exclude_equipment_keywords.append("máquina")
            exclude_equipment_keywords.append("maquina")

        valid_suggestions = []
        impact_map = {"Bajo": 1, "Medio": 2, "Medio-Alto": 2.5, "Alto": 3}
        orig_impact = impact_map.get(original.joint_impact, 2)

        for candidate in candidates:
            # REGLA DE EQUIPAMIENTO: Evitar equipo que no se tiene
            if is_equipment_deficiency and exclude_equipment_keywords:
                should_skip = False
                for req in candidate.equipment_required:
                    if any(kw in req.lower() for kw in exclude_equipment_keywords):
                        should_skip = True
                        break
                if should_skip:
                    continue
                    
            # Si available_equipment está especificado, forzar coincidencia estricta
            if available_equipment:
                # Cada requerimiento del candidato debe estar cubierto por algún equipamiento disponible
                has_all_req = all(
                    any(avail.lower() in req.lower() for avail in available_equipment)
                    for req in candidate.equipment_required
                )
                if not has_all_req:
                    continue

            # REGLA DE HABILIDAD: Regresión estricta o diferencial estándar
            if is_skill_regression:
                # En regresión, el candidato debe tener un nivel de habilidad estrictamente menor
                if candidate.skill_level >= original.skill_level:
                    continue
            else:
                # Diferencial de habilidad estándar <= 1
                if abs(candidate.skill_level - original.skill_level) > 1:
                    continue

            # REGLA DE IMPACTO ARTICULAR: Mitigación de Impacto (No mayor que el original)
            cand_impact = impact_map.get(candidate.joint_impact, 2)
            if cand_impact > orig_impact:
                continue

            # REGLA DE CARGA AXIAL: Carga Axial (Protocolo McGill)
            if athlete_back_pain and candidate.axial_load:
                continue

            valid_suggestions.append(candidate)

        if not valid_suggestions:
            # Si no hay sugerencias válidas y aplicamos regresión estricta o filtros de equipo, relajamos habilidad
            # pero mantenemos seguridad biomecánica y restricciones de carga axial y equipamiento.
            for candidate in candidates:
                if athlete_back_pain and candidate.axial_load:
                    continue
                if available_equipment:
                    has_all_req = all(
                        any(avail.lower() in req.lower() for avail in available_equipment)
                        for req in candidate.equipment_required
                    )
                    if not has_all_req:
                        continue
                cand_impact = impact_map.get(candidate.joint_impact, 2)
                if cand_impact > orig_impact:
                    continue
                # Permitir cualquier nivel de habilidad menor
                if candidate.skill_level < original.skill_level:
                    valid_suggestions.append(candidate)

        if not valid_suggestions:
            return None

        # Ordenar sugerencias inteligentemente
        if is_skill_regression:
            # Nivel de habilidad más cercano por debajo primero, luego mismo grupo muscular
            valid_suggestions.sort(
                key=lambda c: (
                    -c.skill_level,
                    0 if c.primary_muscle == original.primary_muscle else 1,
                    impact_map.get(c.joint_impact, 2)
                )
            )
        else:
            # Mismo grupo muscular primero, luego menor diferencia de habilidad, luego menor impacto
            valid_suggestions.sort(
                key=lambda c: (
                    0 if c.primary_muscle == original.primary_muscle else 1,
                    abs(c.skill_level - original.skill_level),
                    impact_map.get(c.joint_impact, 2)
                )
            )

        best = valid_suggestions[0]

        notes = f"Sustitución validada por motor biomecánico."
        if is_skill_regression:
            notes += f" Regresión de habilidad aplicada ({original.skill_level} -> {best.skill_level})."
        if is_equipment_deficiency:
            notes += " Ajuste por equipamiento completado."
        if athlete_back_pain:
            notes += " Exclusión de carga axial activa (McGill Protocol)."

        return ReplacementResponse(
            original=ExerciseSchema.model_validate(original),
            replacement=ExerciseSchema.model_validate(best),
            reason=reason,
            muscle_preservation_pct=95.0 if best.primary_muscle == original.primary_muscle else 70.0,
            notes=notes
        )
    
    def calculate_sets_reps(
        self,
        one_rep_max: float,
        goal: str = "hypertrophy",
    ) -> dict:
        """
        Calcula sets/reps basado en 1RM y objetivo.
        """
        if goal == "strength":
            return {
                "sets": 5,
                "reps": 3,
                "weight_kg": round(one_rep_max * 0.85, 1),
                "rest_seconds": 180,
                "intensity_pct": 85,
            }
        elif goal == "hypertrophy":
            return {
                "sets": 4,
                "reps": 10,
                "weight_kg": round(one_rep_max * 0.70, 1),
                "rest_seconds": 90,
                "intensity_pct": 70,
            }
        else:  # endurance
            return {
                "sets": 3,
                "reps": 15,
                "weight_kg": round(one_rep_max * 0.55, 1),
                "rest_seconds": 60,
                "intensity_pct": 55,
            }

    async def heuristic_1rm_adjustment(self, exercise_target_id: UUID, db: AsyncSession):
        """
        [GUARDRAIL 2: Revenue Guard]
        Ajuste heurístico y matemático del 1RM sin consumir tokens de LLM.
        """
        import structlog
        from datetime import datetime, timedelta
        
        logger = structlog.get_logger()
        
        result = await db.execute(
            select(ExerciseTarget).where(ExerciseTarget.id == exercise_target_id)
        )
        target = result.scalar_one_or_none()
        
        if not target:
            logger.error("adjustment_failed_not_found", target_id=str(exercise_target_id))
            return False, "Target not found"
            
        # Idempotencia
        now = datetime.utcnow()
        if target.updated_at and (now - target.updated_at) < timedelta(minutes=10):
            logger.info("adjustment_skipped_idempotent", target_id=str(exercise_target_id))
            return True, "Already adjusted recently. Focus and lift!"
            
        # Heuristica Epley/Brzycki simplificada: bajar 10% el peso, subir 2 reps
        if target.weight is not None:
            target.weight = round(target.weight * 0.9, 2)
        if target.reps is not None:
            target.reps += 2
            
        await db.commit()
        logger.info("adjustment_success_math", target_id=str(exercise_target_id), new_weight=target.weight, new_reps=target.reps)
        return True, f"Ajustado a {target.weight}kg. Tómate 2 minutos y dale con todo. 💪"


# Instancia global del servicio
fitness_service = FitnessIntelligenceService()

import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from pydantic import BaseModel

from app.db.models import Exercise, GymEquipment, Client

class ProposedExercise(BaseModel):
    exercise_id: str
    sets: int
    reps: Optional[int] = None

class WorkoutSwapEngineService:
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def evaluate_session(self, client_id: uuid.UUID, proposed_exercises: List[ProposedExercise], current_acwr: float) -> dict:
        """
        Evalúa una sesión propuesta contra las reglas del Swap Engine (Biomecánica y Logística).
        Retorna la sesión optimizada con justificaciones (XAI).
        """
        # 1. Obtener perfil del cliente para filtros médicos (Filtro McGill)
        client_q = await self.db.execute(select(Client).where(Client.id == client_id))
        client = client_q.scalar_one_or_none()
        
        has_lower_back_injury = False
        if client and client.medical_tags:
            # check if medical_tags is list or string
            tags = client.medical_tags
            if isinstance(tags, str):
                has_lower_back_injury = 'inj_lower_back' in tags
            elif isinstance(tags, list):
                has_lower_back_injury = 'inj_lower_back' in tags

        # 2. Obtener equipamiento disponible (Filtro Logístico)
        equipment_q = await self.db.execute(
            select(GymEquipment).where(
                GymEquipment.tenant_id == self.tenant_id,
                GymEquipment.status == 'active',
                GymEquipment.total_quantity > 0
            )
        )
        available_equipment = equipment_q.scalars().all()
        # Usaremos `name` para mapear el equipamiento.
        # Por ej: equipment.name puede ser "barbell", "kettlebell", etc.
        available_equipment_types = set([eq.name.lower() for eq in available_equipment])
        
        # 3. Analizar ACWR (Filtro de Fatiga)
        is_danger_zone = current_acwr > 1.50

        evaluated_session = []
        
        for proposed in proposed_exercises:
            # Buscar el ejercicio propuesto original en la Bóveda Global
            ex_q = await self.db.execute(select(Exercise).where(Exercise.exercise_id == proposed.exercise_id))
            original_ex = ex_q.scalar_one_or_none()
            
            if not original_ex:
                # Si no existe en la Bóveda (ej. un ejercicio custom), lo pasamos tal cual
                evaluated_session.append({
                    "original": proposed.dict(),
                    "final": proposed.dict(),
                    "action": "keep",
                    "reason": "Ejercicio original no encontrado en la Bóveda Global."
                })
                continue
                
            needs_swap = False
            swap_reasons = []
            
            # A) Filtro McGill (Lesiones)
            if has_lower_back_injury and original_ex.axial_load:
                needs_swap = True
                swap_reasons.append("Filtro McGill activado por Tag Clínico (inj_lower_back).")
                
            # B) Filtro Logístico (Equipamiento)
            # original_ex.equipment_required es un list de strings. ej: ["barbell", "plates"]
            equipment_reqs = original_ex.equipment_required
            if isinstance(equipment_reqs, dict):
                equipment_reqs = equipment_reqs.get('primary', [])
            elif isinstance(equipment_reqs, str):
                equipment_reqs = [equipment_reqs]
                
            # Verificamos disponibilidad (match básico ignorando mayúsculas)
            for req in equipment_reqs:
                if req.lower() not in available_equipment_types and req.lower() != "bodyweight":
                    needs_swap = True
                    swap_reasons.append(f"Filtro Logístico: Equipo '{req}' no disponible.")
                    break
                    
            if needs_swap:
                # Buscar Alternativa (Swap Engine Logic)
                query_filters = [
                    Exercise.movement_pattern == original_ex.movement_pattern,
                    Exercise.exercise_id != original_ex.exercise_id
                ]
                
                # Inyección restrictiva de Filtro McGill
                if has_lower_back_injury:
                    query_filters.append(Exercise.axial_load == False)
                    query_filters.append(Exercise.joint_impact == 'Bajo')
                    
                alt_q = await self.db.execute(select(Exercise).where(and_(*query_filters)))
                alternatives = alt_q.scalars().all()
                
                # Filtrar alternativas por equipo disponible y skill level
                valid_alt = None
                
                for alt in alternatives:
                    # Validar equipo de la alternativa
                    alt_reqs = alt.equipment_required
                    if isinstance(alt_reqs, dict):
                        alt_reqs = alt_reqs.get('primary', [])
                    elif isinstance(alt_reqs, str):
                        alt_reqs = [alt_reqs]
                        
                    is_equip_available = True
                    for r in alt_reqs:
                        if r.lower() not in available_equipment_types and r.lower() != "bodyweight":
                            is_equip_available = False
                            break
                            
                    if is_equip_available:
                        valid_alt = alt
                        break  # Tomamos la primera viable para el MVP
                        
                if valid_alt:
                    # Ajuste por Fatiga (ACWR) - MED
                    final_sets = proposed.sets
                    if is_danger_zone:
                        final_sets = max(1, final_sets - 1)
                        swap_reasons.append("Filtro Fatiga (ACWR > 1.50): Volumen reducido a Dosis Mínima Efectiva (MED).")
                        
                    evaluated_session.append({
                        "original": proposed.dict(),
                        "final": {
                            "exercise_id": valid_alt.exercise_id,
                            "official_name": valid_alt.official_name,
                            "sets": final_sets,
                            "reps": proposed.reps
                        },
                        "action": "swapped",
                        "reason": "Sustitución: {} ➔ {}. Razón: {}".format(
                            original_ex.official_name, 
                            valid_alt.official_name, 
                            " ".join(swap_reasons)
                        )
                    })
                else:
                    evaluated_session.append({
                        "original": proposed.dict(),
                        "final": None,
                        "action": "skipped",
                        "reason": " ".join(swap_reasons) + " | No se encontró alternativa viable con el equipo disponible."
                    })
            else:
                # No necesita swap, evaluar reducción de fatiga
                final_sets = proposed.sets
                reason = "Aprobado (Sin restricciones)."
                action = "keep"
                
                if is_danger_zone:
                    final_sets = max(1, final_sets - 1)
                    reason = "Filtro Fatiga (ACWR > 1.50): Volumen reducido a Dosis Mínima Efectiva (MED)."
                    action = "modified"
                    
                evaluated_session.append({
                    "original": proposed.dict(),
                    "final": {
                        "exercise_id": original_ex.exercise_id,
                        "official_name": original_ex.official_name,
                        "sets": final_sets,
                        "reps": proposed.reps
                    },
                    "action": action,
                    "reason": reason
                })

        return {
            "client_id": str(client_id),
            "acwr": current_acwr,
            "danger_zone": is_danger_zone,
            "evaluated_session": evaluated_session
        }

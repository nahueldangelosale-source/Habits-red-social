from typing import List, Dict, Any
import copy
from app.schemas.clinical import AthleteProfile, CleanWorkoutDay, CleanWorkoutItem, BiomechanicalSwapResult

class ClinicalEngine:
    def __init__(self):
        # En una versión real, esto leería del @lru_cache o base de datos de PostgreSQL
        # Mock de taxonomía para TDD
        self.taxonomy = {
            "ex_press_militar": {"pattern": "Empuje Vertical", "axial": True, "equipment": "Barbell"},
            "ex_landmine_press": {"pattern": "Empuje Vertical Asimétrico", "axial": False, "equipment": "Barbell/Kettlebell", "name": "Landmine Press"},
            "ex_back_squat": {"pattern": "Dominante de Rodilla", "axial": True, "equipment": "Barbell"},
            "ex_bulgarian_squat": {"pattern": "Dominante de Rodilla", "axial": False, "equipment": "Dumbbells", "name": "Sentadilla Búlgara"},
            "ex_leg_press": {"pattern": "Dominante de Rodilla", "axial": False, "equipment": "Machine"},
            "ex_goblet_squat": {"pattern": "Dominante de Rodilla", "axial": False, "equipment": "Kettlebell/Dumbbell", "name": "Sentadilla Goblet"}
        }

    def process_day(self, profile: AthleteProfile, day: CleanWorkoutDay) -> CleanWorkoutDay:
        clean_day = CleanWorkoutDay(day_name=day.day_name, items=[], swaps=[])
        
        for item in day.items:
            current_item = copy.deepcopy(item)
            swapped = False
            swap_rationale = ""
            new_name = ""
            new_id = ""

            # Rule 1: Hombro -> Cero Empuje Vertical
            if "INJ_SHLD_01" in profile.injuries and current_item.movement_pattern == "Empuje Vertical":
                swapped = True
                new_id = "ex_landmine_press"
                new_name = self.taxonomy[new_id]["name"]
                swap_rationale = "Pinzamiento detectado. Modificado Empuje Vertical estricto por Landmine Press asimétrico para proteger espacio subacromial."
                current_item.movement_pattern = self.taxonomy[new_id]["pattern"]
                current_item.axial_load = self.taxonomy[new_id]["axial"]
            
            # Rule 2: Lumbar -> Cero Carga Axial
            if "INJ_LUMB_01" in profile.injuries and current_item.axial_load:
                swapped = True
                new_id = "ex_bulgarian_squat"
                new_name = self.taxonomy[new_id]["name"]
                swap_rationale = "Protección L4-L5. Eliminada carga axial espinal, sustituyendo por dominante de rodilla unilateral."
                current_item.axial_load = False
                
            # Rule 3: Home Gym -> No Barbell/Machine
            if profile.session_location == "Home":
                # Si en el mock detectamos Machine, lo cambiamos a Goblet
                if "Machine" in current_item.official_name or "Machine" in self.taxonomy.get(current_item.exercise_id, {}).get("equipment", ""):
                    swapped = True
                    new_id = "ex_goblet_squat"
                    new_name = self.taxonomy[new_id]["name"]
                    swap_rationale = "Home Gym: Máquina no disponible. Cambiado a variante libre (Goblet)."
                    
            # Si hubo swap, registramos el evento XAI
            if swapped:
                clean_day.swaps.append(
                    BiomechanicalSwapResult(
                        original_exercise_id=current_item.exercise_id,
                        original_name=current_item.official_name,
                        new_exercise_id=new_id,
                        new_name=new_name,
                        clinical_rationale=swap_rationale,
                        is_swapped=True
                    )
                )
                current_item.exercise_id = new_id
                current_item.official_name = new_name
            
            # Rule 4: Fatiga SNC -> Reducir RPE
            if profile.cns_fatigue_score == "HIGH":
                if current_item.rpe.isdigit() and int(current_item.rpe) > 8:
                    current_item.rpe = "8"
                    # Podríamos agregar un swap de RPE si quisiéramos trazarlo, pero lo mantendremos simple aquí
            
            clean_day.items.append(current_item)
            
        return clean_day

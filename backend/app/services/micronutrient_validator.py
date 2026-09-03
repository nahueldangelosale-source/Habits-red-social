"""
MICRONUTRIENT VALIDATOR SERVICE
Metabolic Radar - Pathology-specific deficiency alerts

Features:
- Validate meal plans against patient pathologies
- Generate deficiency alerts
- Suggest specific foods to fix gaps
"""

from typing import List, Dict, Optional
from pydantic import BaseModel
from enum import Enum

from ..models.meal_block import (
    Macros, Micros, MealBlockBase, MealPlanWeek,
    PathologyRequirements, PATHOLOGY_REQUIREMENTS
)


# ═══════════════════════════════════════════════════════════════════════════════
# ALERT MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class AlertSeverity(str, Enum):
    LOW = "low"        # Minor shortfall, informational
    MEDIUM = "medium"  # Should address but not critical
    HIGH = "high"      # Must address for this pathology
    CRITICAL = "critical"  # Therapeutically contraindicated


class MicronutrientAlert(BaseModel):
    """Alert for a micronutrient deficiency or excess"""
    severity: AlertSeverity
    nutrient: str  # "iron", "calcium", etc.
    current_value: float
    target_value: float
    unit: str  # "mg", "mcg"
    deficit_percent: float  # How far below target
    
    # User-facing
    message: str  # "Déficit de Hierro detectado"
    suggestion: str  # "Agrega Lentejas el martes"
    suggested_foods: List[str] = []
    
    # Context
    pathology: str  # Which pathology this relates to


class RadarData(BaseModel):
    """Data for the Metabolic Radar spider chart"""
    nutrients: Dict[str, float]  # {"iron": 0.85, "calcium": 0.62} - ratio to target
    alerts: List[MicronutrientAlert]
    overall_score: float  # 0-1, how complete the plan is


# ═══════════════════════════════════════════════════════════════════════════════
# FOOD SUGGESTIONS BY NUTRIENT
# ═══════════════════════════════════════════════════════════════════════════════

NUTRIENT_RICH_FOODS = {
    "iron": [
        ("Lentejas", 3.3, "mg/100g"),
        ("Espinaca", 2.7, "mg/100g"),
        ("Carne Roja", 2.6, "mg/100g"),
        ("Hígado de Pollo", 9.0, "mg/100g"),
        ("Quinoa", 1.5, "mg/100g"),
    ],
    "calcium": [
        ("Yogurt Natural", 110, "mg/100g"),
        ("Queso Parmesano", 1184, "mg/100g"),
        ("Sardinas", 382, "mg/100g"),
        ("Almendras", 264, "mg/100g"),
        ("Brócoli", 47, "mg/100g"),
    ],
    "selenium": [
        ("Nueces de Brasil", 1917, "mcg/100g"),
        ("Atún", 90, "mcg/100g"),
        ("Huevo", 30, "mcg/100g"),
        ("Salmón", 36, "mcg/100g"),
        ("Arroz Integral", 10, "mcg/100g"),
    ],
    "vitamin_d": [
        ("Salmón", 11, "mcg/100g"),
        ("Sardinas", 4.8, "mcg/100g"),
        ("Huevo", 2, "mcg/100g"),
        ("Champiñones UV", 17, "mcg/100g"),
        ("Leche Fortificada", 1.2, "mcg/100ml"),
    ],
    "magnesium": [
        ("Almendras", 270, "mg/100g"),
        ("Espinaca", 79, "mg/100g"),
        ("Chocolate Negro", 228, "mg/100g"),
        ("Aguacate", 29, "mg/100g"),
        ("Banana", 27, "mg/100g"),
    ],
    "b12": [
        ("Hígado de Res", 70, "mcg/100g"),
        ("Almejas", 84, "mcg/100g"),
        ("Sardinas", 8.9, "mcg/100g"),
        ("Salmón", 2.8, "mcg/100g"),
        ("Huevo", 1.1, "mcg/100g"),
    ],
    "folate": [
        ("Lentejas", 181, "mcg/100g"),
        ("Espinaca", 194, "mcg/100g"),
        ("Espárrago", 52, "mcg/100g"),
        ("Aguacate", 81, "mcg/100g"),
        ("Brócoli", 63, "mcg/100g"),
    ],
    "zinc": [
        ("Ostras", 61, "mg/100g"),
        ("Carne de Res", 4.8, "mg/100g"),
        ("Semillas de Calabaza", 7.8, "mg/100g"),
        ("Pollo", 1.0, "mg/100g"),
        ("Garbanzos", 1.5, "mg/100g"),
    ],
}


# ═══════════════════════════════════════════════════════════════════════════════
# VALIDATOR CLASS
# ═══════════════════════════════════════════════════════════════════════════════

class MicronutrientValidator:
    """
    Validates meal plans against pathology-specific requirements.
    Powers the Metabolic Radar visualization.
    """
    
    def __init__(self):
        self.requirements = PATHOLOGY_REQUIREMENTS
        self.food_suggestions = NUTRIENT_RICH_FOODS
    
    def aggregate_plan_micros(self, plan: MealPlanWeek) -> Micros:
        """
        Calculate average daily micronutrients across the plan.
        Returns average per day.
        """
        total_days = len(plan.days)
        if total_days == 0:
            return Micros()
        
        total = Micros()
        for day in plan.days:
            if day.daily_micros:
                total.iron += day.daily_micros.iron
                total.calcium += day.daily_micros.calcium
                total.zinc += day.daily_micros.zinc
                total.magnesium += day.daily_micros.magnesium
                total.selenium += day.daily_micros.selenium
                total.vitamin_d += day.daily_micros.vitamin_d
                total.vitamin_b12 += day.daily_micros.vitamin_b12
                total.folate += day.daily_micros.folate
                total.potassium += day.daily_micros.potassium
                total.sodium += day.daily_micros.sodium
                total.omega_3 += day.daily_micros.omega_3
        
        # Return daily average
        return Micros(
            iron=total.iron / total_days,
            calcium=total.calcium / total_days,
            zinc=total.zinc / total_days,
            magnesium=total.magnesium / total_days,
            selenium=total.selenium / total_days,
            vitamin_d=total.vitamin_d / total_days,
            vitamin_b12=total.vitamin_b12 / total_days,
            folate=total.folate / total_days,
            potassium=total.potassium / total_days,
            sodium=total.sodium / total_days,
            omega_3=total.omega_3 / total_days
        )
    
    def _get_severity(self, deficit_percent: float) -> AlertSeverity:
        """Determine alert severity based on deficit percentage"""
        if deficit_percent >= 50:
            return AlertSeverity.CRITICAL
        elif deficit_percent >= 30:
            return AlertSeverity.HIGH
        elif deficit_percent >= 15:
            return AlertSeverity.MEDIUM
        else:
            return AlertSeverity.LOW
    
    def _get_suggestion(self, nutrient: str, allergies: List[str] = None) -> tuple[str, List[str]]:
        """Get food suggestions for a nutrient deficiency"""
        allergies = allergies or []
        foods = self.food_suggestions.get(nutrient, [])
        
        safe_foods = []
        for food_name, amount, unit in foods:
            # Simple allergy filter
            food_lower = food_name.lower()
            is_safe = True
            for allergy in allergies:
                allergy_lower = allergy.lower()
                if allergy_lower in food_lower:
                    is_safe = False
                    break
                if allergy_lower == "dairy" and ("queso" in food_lower or "yogurt" in food_lower or "leche" in food_lower):
                    is_safe = False
                    break
                if allergy_lower == "nuts" and ("almendras" in food_lower or "nueces" in food_lower):
                    is_safe = False
                    break
            
            if is_safe:
                safe_foods.append(f"{food_name} ({amount} {unit})")
        
        if safe_foods:
            suggestion = f"Agrega {safe_foods[0].split(' (')[0]} a tu plan"
            return suggestion, safe_foods[:3]
        
        return "Consulta opciones con tu nutricionista", []
    
    def validate_plan(
        self,
        plan_micros: Micros,
        pathologies: List[str],
        allergies: List[str] = None
    ) -> List[MicronutrientAlert]:
        """
        Validate a meal plan's micronutrients against pathology requirements.
        
        Args:
            plan_micros: Aggregated daily average micros from the plan
            pathologies: List of patient pathology codes
            allergies: Patient allergies for filtering suggestions
        
        Returns:
            List of alerts for deficiencies
        """
        alerts = []
        
        for pathology in pathologies:
            req = self.requirements.get(pathology)
            if not req:
                continue
            
            # Check each nutrient requirement
            checks = [
                ("iron", plan_micros.iron, req.min_iron, "mg"),
                ("calcium", plan_micros.calcium, req.min_calcium, "mg"),
                ("zinc", plan_micros.zinc, req.min_zinc, "mg"),
                ("selenium", plan_micros.selenium, req.min_selenium, "mcg"),
                ("vitamin_d", plan_micros.vitamin_d, req.min_vitamin_d, "mcg"),
                ("b12", plan_micros.vitamin_b12, req.min_b12, "mcg"),
                ("folate", plan_micros.folate, req.min_folate, "mcg"),
                ("magnesium", plan_micros.magnesium, req.min_magnesium, "mg"),
            ]
            
            for nutrient, current, target, unit in checks:
                if target is None:
                    continue
                
                if current < target:
                    deficit_percent = ((target - current) / target) * 100
                    severity = self._get_severity(deficit_percent)
                    suggestion, foods = self._get_suggestion(nutrient, allergies)
                    
                    # Translate nutrient names
                    nutrient_names = {
                        "iron": "Hierro",
                        "calcium": "Calcio",
                        "zinc": "Zinc",
                        "selenium": "Selenio",
                        "vitamin_d": "Vitamina D",
                        "b12": "Vitamina B12",
                        "folate": "Folato",
                        "magnesium": "Magnesio"
                    }
                    
                    alerts.append(MicronutrientAlert(
                        severity=severity,
                        nutrient=nutrient,
                        current_value=round(current, 1),
                        target_value=target,
                        unit=unit,
                        deficit_percent=round(deficit_percent, 1),
                        message=f"Déficit de {nutrient_names.get(nutrient, nutrient)} detectado",
                        suggestion=suggestion,
                        suggested_foods=foods,
                        pathology=pathology
                    ))
            
            # Check sodium maximum (for hypertension)
            if req.max_sodium and plan_micros.sodium > req.max_sodium:
                excess = ((plan_micros.sodium - req.max_sodium) / req.max_sodium) * 100
                alerts.append(MicronutrientAlert(
                    severity=AlertSeverity.HIGH if excess > 20 else AlertSeverity.MEDIUM,
                    nutrient="sodium",
                    current_value=round(plan_micros.sodium, 0),
                    target_value=req.max_sodium,
                    unit="mg",
                    deficit_percent=-excess,  # Negative = excess
                    message="Exceso de Sodio detectado",
                    suggestion="Reduce alimentos procesados y sal añadida",
                    suggested_foods=["Hierbas frescas", "Especias sin sal", "Limón"],
                    pathology=pathology
                ))
        
        return alerts
    
    def generate_radar_data(
        self,
        plan_micros: Micros,
        pathologies: List[str],
        allergies: List[str] = None
    ) -> RadarData:
        """
        Generate data for the Metabolic Radar spider chart.
        Returns ratios (0-1+) for each relevant nutrient.
        """
        alerts = self.validate_plan(plan_micros, pathologies, allergies)
        
        # Collect all relevant requirements
        all_targets = {}
        for pathology in pathologies:
            req = self.requirements.get(pathology)
            if not req:
                continue
            
            if req.min_iron:
                all_targets["iron"] = max(all_targets.get("iron", 0), req.min_iron)
            if req.min_calcium:
                all_targets["calcium"] = max(all_targets.get("calcium", 0), req.min_calcium)
            if req.min_selenium:
                all_targets["selenium"] = max(all_targets.get("selenium", 0), req.min_selenium)
            if req.min_vitamin_d:
                all_targets["vitamin_d"] = max(all_targets.get("vitamin_d", 0), req.min_vitamin_d)
            if req.min_magnesium:
                all_targets["magnesium"] = max(all_targets.get("magnesium", 0), req.min_magnesium)
            if req.min_b12:
                all_targets["b12"] = max(all_targets.get("b12", 0), req.min_b12)
        
        # Calculate ratios
        nutrients = {}
        current_values = {
            "iron": plan_micros.iron,
            "calcium": plan_micros.calcium,
            "selenium": plan_micros.selenium,
            "vitamin_d": plan_micros.vitamin_d,
            "magnesium": plan_micros.magnesium,
            "b12": plan_micros.vitamin_b12
        }
        
        for nutrient, target in all_targets.items():
            current = current_values.get(nutrient, 0)
            ratio = min(current / target, 1.5) if target > 0 else 1.0
            nutrients[nutrient] = round(ratio, 2)
        
        # Calculate overall score
        if nutrients:
            overall = sum(min(v, 1.0) for v in nutrients.values()) / len(nutrients)
        else:
            overall = 1.0
        
        return RadarData(
            nutrients=nutrients,
            alerts=alerts,
            overall_score=round(overall, 2)
        )


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

micronutrient_validator = MicronutrientValidator()


def validate_plan_micros(
    plan_micros: Micros,
    pathologies: List[str],
    allergies: List[str] = None
) -> List[MicronutrientAlert]:
    """Public API for validating micronutrients"""
    return micronutrient_validator.validate_plan(plan_micros, pathologies, allergies)


def get_radar_data(
    plan_micros: Micros,
    pathologies: List[str],
    allergies: List[str] = None
) -> RadarData:
    """Public API for radar chart data"""
    return micronutrient_validator.generate_radar_data(plan_micros, pathologies, allergies)

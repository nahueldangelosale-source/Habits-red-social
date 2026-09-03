"""
DIET ARCHETYPE MODEL
Clone & Tweak System - Template diets that auto-recalculate

Features:
- Save diet "archetypes" (e.g., "Protocolo SIBO Fase 1")
- Auto-recalculate for new patient's weight/height
- Version control for templates
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

from .meal_block import MealBlockBase, DietType, Macros, PathologyRequirements


# ═══════════════════════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════════════════════

class ArchetypeCategory(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    MAINTENANCE = "maintenance"
    THERAPEUTIC = "therapeutic"  # SIBO, FODMAP, etc.
    SPORTS = "sports"
    GENERAL_HEALTH = "general_health"


class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"       # 1.2
    LIGHT = "light"               # 1.375
    MODERATE = "moderate"         # 1.55
    ACTIVE = "active"             # 1.725
    VERY_ACTIVE = "very_active"   # 1.9


# ═══════════════════════════════════════════════════════════════════════════════
# PATIENT PROFILE (for recalculation)
# ═══════════════════════════════════════════════════════════════════════════════

class PatientProfile(BaseModel):
    """Patient data for caloric/macro recalculation"""
    id: str
    name: str
    age: int
    gender: str  # "male", "female"
    weight_kg: float
    height_cm: float
    activity_level: ActivityLevel
    goal: str  # "fat_loss", "muscle_gain", "maintenance"
    pathologies: List[str] = []  # ["anemia", "hypothyroidism"]
    allergies: List[str] = []    # ["gluten", "dairy", "nuts"]
    diet_preferences: List[str] = []  # ["vegetarian", "no_pork"]


# ═══════════════════════════════════════════════════════════════════════════════
# ARCHETYPE MODEL
# ═══════════════════════════════════════════════════════════════════════════════

class DietArchetype(BaseModel):
    """
    A template diet that can be cloned and auto-adjusted.
    The professional saves "Protocolo X" once, then applies it
    to multiple patients with automatic recalculation.
    """
    id: str
    name: str  # "Protocolo SIBO Fase 1"
    description: str
    category: ArchetypeCategory
    diet_type: DietType
    
    # Creator info
    created_by: str  # professional_id
    created_at: datetime
    updated_at: datetime
    version: int = 1
    
    # Template configuration
    tags: List[str] = []  # ["sibo_safe", "low_fodmap", "anti_inflammatory"]
    target_pathologies: List[str] = []  # Which conditions this is designed for
    contraindications: List[str] = []   # Which conditions should NOT use this
    
    # Macro ratios (percentages, should sum to 100)
    protein_percent: float = 30  # 30% of calories from protein
    carbs_percent: float = 40    # 40% from carbs
    fat_percent: float = 30      # 30% from fat
    
    # Template meals (will be scaled per patient)
    template_meals: List[MealBlockBase] = []
    
    # Notes for the professional
    clinical_notes: Optional[str] = None
    
    # Usage stats
    times_applied: int = 0
    avg_patient_satisfaction: Optional[float] = None


class ArchetypeApplication(BaseModel):
    """Result of applying an archetype to a specific patient"""
    archetype_id: str
    patient_id: str
    applied_at: datetime
    
    # Original template values
    original_calories: int
    original_protein: int
    
    # Recalculated values for this patient
    adjusted_calories: int
    adjusted_protein: int
    adjusted_carbs: int
    adjusted_fat: int
    
    # Scaling factor used
    scaling_factor: float
    
    # The actual meal plan generated
    generated_plan_id: str


# ═══════════════════════════════════════════════════════════════════════════════
# RECALCULATION LOGIC
# ═══════════════════════════════════════════════════════════════════════════════

ACTIVITY_MULTIPLIERS = {
    ActivityLevel.SEDENTARY: 1.2,
    ActivityLevel.LIGHT: 1.375,
    ActivityLevel.MODERATE: 1.55,
    ActivityLevel.ACTIVE: 1.725,
    ActivityLevel.VERY_ACTIVE: 1.9,
}


def calculate_bmr(patient: PatientProfile) -> float:
    """
    Mifflin-St Jeor Equation for BMR.
    Most accurate for modern populations.
    """
    if patient.gender.lower() == "male":
        bmr = (10 * patient.weight_kg) + (6.25 * patient.height_cm) - (5 * patient.age) + 5
    else:
        bmr = (10 * patient.weight_kg) + (6.25 * patient.height_cm) - (5 * patient.age) - 161
    return bmr


def calculate_tdee(patient: PatientProfile) -> float:
    """Total Daily Energy Expenditure = BMR * Activity Multiplier"""
    bmr = calculate_bmr(patient)
    multiplier = ACTIVITY_MULTIPLIERS.get(patient.activity_level, 1.55)
    return bmr * multiplier


def calculate_target_calories(patient: PatientProfile) -> int:
    """
    Adjust TDEE based on goal:
    - Fat loss: -20% deficit
    - Muscle gain: +10% surplus
    - Maintenance: TDEE
    """
    tdee = calculate_tdee(patient)
    
    if patient.goal == "fat_loss":
        return int(tdee * 0.80)  # 20% deficit
    elif patient.goal == "muscle_gain":
        return int(tdee * 1.10)  # 10% surplus
    else:
        return int(tdee)


def calculate_macros_from_archetype(
    archetype: DietArchetype,
    patient: PatientProfile
) -> Macros:
    """
    Calculate specific macros based on archetype ratios
    and patient-specific caloric needs.
    
    Protein: 4 cal/g
    Carbs: 4 cal/g
    Fat: 9 cal/g
    """
    target_calories = calculate_target_calories(patient)
    
    protein_cals = target_calories * (archetype.protein_percent / 100)
    carbs_cals = target_calories * (archetype.carbs_percent / 100)
    fat_cals = target_calories * (archetype.fat_percent / 100)
    
    return Macros(
        calories=target_calories,
        protein=protein_cals / 4,
        carbs=carbs_cals / 4,
        fat=fat_cals / 9,
        fiber=25 if patient.gender == "female" else 38  # Recommended daily
    )


def scale_meal_portions(
    template_meal: MealBlockBase,
    original_calories: int,
    target_calories: int
) -> MealBlockBase:
    """
    Scale all ingredient portions proportionally
    to match new caloric target.
    """
    scaling_factor = target_calories / original_calories
    
    scaled_ingredients = []
    for ing in template_meal.ingredients:
        scaled_ing = ing.model_copy()
        scaled_ing.portion_grams *= scaling_factor
        scaled_ing.macros.calories *= scaling_factor
        scaled_ing.macros.protein *= scaling_factor
        scaled_ing.macros.carbs *= scaling_factor
        scaled_ing.macros.fat *= scaling_factor
        scaled_ing.macros.fiber *= scaling_factor
        scaled_ingredients.append(scaled_ing)
    
    scaled_meal = template_meal.model_copy()
    scaled_meal.ingredients = scaled_ingredients
    scaled_meal.total_macros.calories *= scaling_factor
    scaled_meal.total_macros.protein *= scaling_factor
    scaled_meal.total_macros.carbs *= scaling_factor
    scaled_meal.total_macros.fat *= scaling_factor
    
    return scaled_meal


# ═══════════════════════════════════════════════════════════════════════════════
# SAMPLE ARCHETYPES
# ═══════════════════════════════════════════════════════════════════════════════

SAMPLE_ARCHETYPES = {
    "sibo_phase1": DietArchetype(
        id="sibo_phase1",
        name="Protocolo SIBO Fase 1 (Eliminación)",
        description="Dieta de eliminación estricta para sobrecrecimiento bacteriano. Duración: 2-4 semanas.",
        category=ArchetypeCategory.THERAPEUTIC,
        diet_type=DietType.SIBO,
        created_by="system",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        tags=["sibo_safe", "low_fodmap", "gut_healing"],
        target_pathologies=["sibo", "ibs", "leaky_gut"],
        contraindications=["eating_disorder", "underweight"],
        protein_percent=30,
        carbs_percent=35,
        fat_percent=35,
        clinical_notes="Evitar: legumbres, cebolla, ajo, lácteos. Permitir: proteínas magras, vegetales bajos en FODMAP, grasas saludables."
    ),
    "keto_fat_loss": DietArchetype(
        id="keto_fat_loss",
        name="Keto para Pérdida de Grasa",
        description="Dieta cetogénica clásica para pérdida de peso. 20-50g carbos/día.",
        category=ArchetypeCategory.WEIGHT_LOSS,
        diet_type=DietType.KETO,
        created_by="system",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        tags=["keto", "low_carb", "high_fat"],
        target_pathologies=["obesity", "metabolic_syndrome", "pcos"],
        contraindications=["type1_diabetes", "kidney_disease", "liver_disease"],
        protein_percent=25,
        carbs_percent=5,
        fat_percent=70,
        clinical_notes="Monitorear cetonas. Suplementar electrolitos (Na, K, Mg). Hidratación mínima 2.5L/día."
    ),
    "muscle_gain_standard": DietArchetype(
        id="muscle_gain_standard",
        name="Hipercalórica para Masa Muscular",
        description="Superávit calórico controlado con alto aporte proteico para hipertrofia.",
        category=ArchetypeCategory.MUSCLE_GAIN,
        diet_type=DietType.STANDARD,
        created_by="system",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        tags=["high_protein", "muscle_building", "bulking"],
        target_pathologies=[],
        contraindications=["kidney_disease"],
        protein_percent=35,
        carbs_percent=45,
        fat_percent=20,
        clinical_notes="Distribuir proteína cada 3-4h. Priorizar proteína post-entreno. Mínimo 1.6g/kg de peso."
    ),
    "mediterranean_heart": DietArchetype(
        id="mediterranean_heart",
        name="Mediterránea Cardioprotectora",
        description="Patrón mediterráneo para salud cardiovascular. Alta en omega-3 y antioxidantes.",
        category=ArchetypeCategory.GENERAL_HEALTH,
        diet_type=DietType.MEDITERRANEAN,
        created_by="system",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        tags=["heart_healthy", "anti_inflammatory", "omega_3"],
        target_pathologies=["hypertension", "high_cholesterol", "atherosclerosis"],
        contraindications=[],
        protein_percent=20,
        carbs_percent=45,
        fat_percent=35,
        clinical_notes="Aceite de oliva virgen extra diario. Pescado azul 2-3x/semana. Frutos secos como snack."
    ),
}

"""
MEAL BLOCK & NUTRITION DATA MODELS
Advanced Nutrition Engine - Core entities

Features:
- MealBlock with swap_group for equivalences
- Ingredient with full micro/macro composition
- SwapGroup for intelligent substitutions
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from typing import List, Optional
from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════════════════════

class DietType(str, enum.Enum):
    STANDARD = "standard"
    KETO = "keto"
    LOW_CARB = "low_carb"
    MEDITERRANEAN = "mediterranean"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    PALEO = "paleo"
    SIBO = "sibo"
    FODMAP = "fodmap"
    DIABETIC = "diabetic"


class MealTime(str, enum.Enum):
    BREAKFAST = "breakfast"
    MID_MORNING = "mid_morning"
    LUNCH = "lunch"
    SNACK = "snack"
    DINNER = "dinner"
    PRE_WORKOUT = "pre_workout"
    POST_WORKOUT = "post_workout"


class SwapReason(str, enum.Enum):
    CHEAPER = "cheaper"
    VEGAN = "vegan"
    PRACTICAL = "practical"
    ALLERGY_SAFE = "allergy_safe"
    LOCAL = "local"


# ═══════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS (API)
# ═══════════════════════════════════════════════════════════════════════════════

class Macros(BaseModel):
    """Macronutrient breakdown"""
    calories: float = 0
    protein: float = 0  # grams
    carbs: float = 0    # grams
    fat: float = 0      # grams
    fiber: float = 0    # grams


class Micros(BaseModel):
    """Micronutrient values (mg or mcg as noted)"""
    iron: float = 0          # mg
    calcium: float = 0       # mg
    zinc: float = 0          # mg
    magnesium: float = 0     # mg
    selenium: float = 0      # mcg
    vitamin_d: float = 0     # mcg
    vitamin_b12: float = 0   # mcg
    folate: float = 0        # mcg
    potassium: float = 0     # mg
    sodium: float = 0        # mg
    omega_3: float = 0       # g


class IngredientBase(BaseModel):
    """Single ingredient with nutritional data"""
    id: str
    name: str
    portion_grams: float
    macros: Macros
    micros: Optional[Micros] = None
    tags: List[str] = []  # ["dairy_free", "gluten_free", "high_protein"]
    allergens: List[str] = []  # ["gluten", "dairy", "nuts"]
    swap_group_id: Optional[str] = None  # Links to equivalent ingredients


class SwapOption(BaseModel):
    """Alternative ingredient suggestion"""
    ingredient: IngredientBase
    reason: SwapReason
    reason_text: str  # "Más barato", "Opción Vegana", etc.
    macro_diff_percent: float  # How close to original (0 = identical)


class MealBlockBase(BaseModel):
    """A single meal unit (e.g., "Desayuno Energético")"""
    id: str
    name: str
    meal_time: MealTime
    description: Optional[str] = None
    ingredients: List[IngredientBase]
    total_macros: Macros
    total_micros: Optional[Micros] = None
    tags: List[str] = []  # ["dairy_free", "high_protein", "sibo_safe"]
    prep_time_minutes: int = 15
    cooking_instructions: Optional[str] = None
    # For Clone & Tweak
    archetype_id: Optional[str] = None
    is_template: bool = False


class MealPlanDay(BaseModel):
    """A full day's meal plan"""
    day_name: str  # "Lunes", "Martes", etc.
    day_number: int  # 1-7
    meals: List[MealBlockBase]
    daily_macros: Macros
    daily_micros: Optional[Micros] = None


class MealPlanWeek(BaseModel):
    """Weekly meal plan"""
    id: str
    patient_id: str
    professional_id: str
    name: str
    diet_type: DietType
    target_calories: int
    target_protein: int
    days: List[MealPlanDay]
    created_at: datetime
    starts_at: datetime
    notes: Optional[str] = None


# ═══════════════════════════════════════════════════════════════════════════════
# MICRONUTRIENT REQUIREMENTS (For Metabolic Radar)
# ═══════════════════════════════════════════════════════════════════════════════

class PathologyRequirements(BaseModel):
    """
    Micronutrient requirements based on patient pathology.
    Used by Metabolic Radar for deficiency alerts.
    """
    pathology: str  # "anemia", "hypothyroidism", "osteoporosis"
    min_iron: Optional[float] = None       # mg/day
    min_calcium: Optional[float] = None    # mg/day
    min_zinc: Optional[float] = None       # mg/day
    min_selenium: Optional[float] = None   # mcg/day
    min_vitamin_d: Optional[float] = None  # mcg/day
    min_b12: Optional[float] = None        # mcg/day
    min_folate: Optional[float] = None     # mcg/day
    min_magnesium: Optional[float] = None  # mg/day
    max_sodium: Optional[float] = None     # mg/day (for hypertension)
    notes: Optional[str] = None


# Default requirements by pathology
PATHOLOGY_REQUIREMENTS = {
    "anemia": PathologyRequirements(
        pathology="anemia",
        min_iron=18,
        min_b12=2.4,
        min_folate=400,
        notes="Priorizar hierro hemo, combinar con vitamina C"
    ),
    "hypothyroidism": PathologyRequirements(
        pathology="hypothyroidism",
        min_selenium=55,
        min_zinc=8,
        notes="Evitar soja cruda, priorizar selenio"
    ),
    "osteoporosis": PathologyRequirements(
        pathology="osteoporosis",
        min_calcium=1200,
        min_vitamin_d=20,
        min_magnesium=320,
        notes="Calcio + Vitamina D juntos para absorción"
    ),
    "hypertension": PathologyRequirements(
        pathology="hypertension",
        max_sodium=1500,
        min_potassium=4700,
        min_magnesium=400,
        notes="Dieta DASH recomendada"
    ),
    "diabetes_t2": PathologyRequirements(
        pathology="diabetes_t2",
        min_magnesium=400,
        min_chromium=35,
        notes="Bajo índice glucémico, fibra alta"
    ),
}


# ═══════════════════════════════════════════════════════════════════════════════
# SAMPLE INGREDIENTS DATABASE
# ═══════════════════════════════════════════════════════════════════════════════

SAMPLE_INGREDIENTS = {
    "salmon_100g": IngredientBase(
        id="salmon_100g",
        name="Salmón",
        portion_grams=100,
        macros=Macros(calories=208, protein=20, carbs=0, fat=13, fiber=0),
        micros=Micros(omega_3=2.3, selenium=36, vitamin_d=11, b12=2.8),
        tags=["high_protein", "omega_3", "keto_friendly"],
        allergens=["fish"],
        swap_group_id="protein_fish"
    ),
    "tuna_100g": IngredientBase(
        id="tuna_100g",
        name="Atún",
        portion_grams=100,
        macros=Macros(calories=132, protein=28, carbs=0, fat=1, fiber=0),
        micros=Micros(omega_3=0.3, selenium=90, vitamin_d=2, b12=2.2),
        tags=["high_protein", "low_fat", "budget_friendly"],
        allergens=["fish"],
        swap_group_id="protein_fish"
    ),
    "tofu_100g": IngredientBase(
        id="tofu_100g",
        name="Tofu Firme",
        portion_grams=100,
        macros=Macros(calories=144, protein=15, carbs=3, fat=8, fiber=2),
        micros=Micros(calcium=350, iron=5.4, magnesium=60),
        tags=["vegan", "high_protein", "soy"],
        allergens=["soy"],
        swap_group_id="protein_fish"  # Can swap with fish for protein
    ),
    "chicken_breast_100g": IngredientBase(
        id="chicken_breast_100g",
        name="Pechuga de Pollo",
        portion_grams=100,
        macros=Macros(calories=165, protein=31, carbs=0, fat=3.6, fiber=0),
        micros=Micros(selenium=27, b12=0.3, zinc=1),
        tags=["high_protein", "low_fat", "versatile"],
        allergens=[],
        swap_group_id="protein_poultry"
    ),
    "lentils_100g": IngredientBase(
        id="lentils_100g",
        name="Lentejas Cocidas",
        portion_grams=100,
        macros=Macros(calories=116, protein=9, carbs=20, fat=0.4, fiber=8),
        micros=Micros(iron=3.3, folate=181, magnesium=36, potassium=369),
        tags=["vegan", "high_fiber", "iron_rich"],
        allergens=[],
        swap_group_id="protein_legumes"
    ),
    "eggs_2": IngredientBase(
        id="eggs_2",
        name="Huevos (2 unidades)",
        portion_grams=100,
        macros=Macros(calories=155, protein=13, carbs=1, fat=11, fiber=0),
        micros=Micros(selenium=30, b12=1.1, vitamin_d=2, choline=294),
        tags=["high_protein", "keto_friendly", "versatile"],
        allergens=["eggs"],
        swap_group_id="protein_eggs"
    ),
    "oats_50g": IngredientBase(
        id="oats_50g",
        name="Avena",
        portion_grams=50,
        macros=Macros(calories=194, protein=6.5, carbs=33, fat=3.5, fiber=5),
        micros=Micros(iron=2.3, magnesium=87, zinc=2),
        tags=["high_fiber", "complex_carbs", "breakfast"],
        allergens=["gluten"],
        swap_group_id="carbs_grains"
    ),
    "brown_rice_100g": IngredientBase(
        id="brown_rice_100g",
        name="Arroz Integral",
        portion_grams=100,
        macros=Macros(calories=123, protein=2.7, carbs=26, fat=1, fiber=1.6),
        micros=Micros(magnesium=39, selenium=10),
        tags=["complex_carbs", "gluten_free"],
        allergens=[],
        swap_group_id="carbs_grains"
    ),
    "quinoa_100g": IngredientBase(
        id="quinoa_100g",
        name="Quinoa Cocida",
        portion_grams=100,
        macros=Macros(calories=120, protein=4.4, carbs=21, fat=1.9, fiber=2.8),
        micros=Micros(iron=1.5, magnesium=64, folate=42),
        tags=["complete_protein", "gluten_free", "vegan"],
        allergens=[],
        swap_group_id="carbs_grains"
    ),
    "broccoli_100g": IngredientBase(
        id="broccoli_100g",
        name="Brócoli",
        portion_grams=100,
        macros=Macros(calories=34, protein=2.8, carbs=7, fat=0.4, fiber=2.6),
        micros=Micros(vitamin_c=89, calcium=47, folate=63, potassium=316),
        tags=["low_calorie", "high_fiber", "thyroid_supportive"],
        allergens=[],
        swap_group_id="veggies_cruciferous"
    ),
    "spinach_100g": IngredientBase(
        id="spinach_100g",
        name="Espinaca",
        portion_grams=100,
        macros=Macros(calories=23, protein=2.9, carbs=3.6, fat=0.4, fiber=2.2),
        micros=Micros(iron=2.7, calcium=99, magnesium=79, folate=194),
        tags=["iron_rich", "low_calorie", "leafy_green"],
        allergens=[],
        swap_group_id="veggies_leafy"
    ),
}


# ═══════════════════════════════════════════════════════════════════════════════
# SWAP GROUPS (Equivalence Mapping)
# ═══════════════════════════════════════════════════════════════════════════════

SWAP_GROUPS = {
    "protein_fish": {
        "name": "Proteína de Pescado",
        "members": ["salmon_100g", "tuna_100g", "tofu_100g"],
        "primary_macro": "protein"
    },
    "protein_poultry": {
        "name": "Proteína de Ave",
        "members": ["chicken_breast_100g", "turkey_breast_100g"],
        "primary_macro": "protein"
    },
    "protein_legumes": {
        "name": "Proteína Vegetal",
        "members": ["lentils_100g", "chickpeas_100g", "black_beans_100g"],
        "primary_macro": "protein"
    },
    "carbs_grains": {
        "name": "Carbohidratos Complejos",
        "members": ["oats_50g", "brown_rice_100g", "quinoa_100g"],
        "primary_macro": "carbs"
    },
    "veggies_cruciferous": {
        "name": "Vegetales Crucíferos",
        "members": ["broccoli_100g", "cauliflower_100g", "brussels_sprouts_100g"],
        "primary_macro": "fiber"
    },
    "veggies_leafy": {
        "name": "Hojas Verdes",
        "members": ["spinach_100g", "kale_100g", "chard_100g"],
        "primary_macro": "fiber"
    },
}

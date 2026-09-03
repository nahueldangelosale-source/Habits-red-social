"""
DietQA Domain — Pydantic Schemas
Payload de entrada del Zero Client Wizard y respuesta del motor de planes.
"""

from pydantic import BaseModel, Field
from typing import Literal
from enum import Enum


# ─── Enums Clínicos ───

class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHT = "light"
    ACTIVE = "active"

class GutHealth(str, Enum):
    PERFECT = "perfect"
    BLOATED = "bloated"
    IRREGULAR = "irregular"

class ClinicalHardStop(str, Enum):
    CERO_LACTEOS = "CERO_LACTEOS"
    SIN_GLUTEN = "SIN_GLUTEN"
    VEGANO = "VEGANO"
    KETO = "KETO"
    HIPERTENSION = "HIPERTENSION"

class ArchetypeEnum(str, Enum):
    LONGEVITY = "ARQ_09_LONGEVITY_VITALITY"
    TIME_CRUNCH = "ARQ_07_TIME_CRUNCH_2X"
    PPL = "ARQ_03_PPL"
    WELLNESS = "ARQ_01_WELLNESS"
    CUSTOM = "ARQ_CUSTOM"


# ─── Request: Payload del Zero Client Wizard ───

class BiometricsPayload(BaseModel):
    weight: float = Field(..., ge=30, le=250, description="Peso corporal en kg")
    height: float = Field(..., ge=100, le=250, description="Estatura en cm")
    age: int = Field(..., ge=10, le=120, description="Edad en años")
    waist: float = Field(..., ge=40, le=200, description="Circunferencia abdominal en cm")
    gender: GenderEnum
    activity_level: ActivityLevel = ActivityLevel.SEDENTARY

class PatientIdentity(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = ""
    email: str = ""

class GeneratePlanRequest(BaseModel):
    """
    El payload JSON completo que el Zero Client Wizard envía al backend.
    Todas las variables clínicas necesarias para generar un plan seguro.
    """
    biometrics: BiometricsPayload
    archetype: ArchetypeEnum
    clinical_hard_stops: list[ClinicalHardStop] = []
    gut_health: GutHealth = GutHealth.PERFECT
    medication_glp1: bool = False
    meal_schedule: str = "3meals"
    patient: PatientIdentity


# ─── Response: Plan Asimétrico generado ───

class RecipeDTO(BaseModel):
    id: str
    name: str
    meal_type: str  # Breakfast / Lunch / Dinner / Snack
    prep_time: int  # minutes
    calories: float
    protein: float
    carbs: float
    fats: float
    substitutions: list[dict] = []  # [{original: "Mantequilla", replacement: "Ghee"}]

class DayPlan(BaseModel):
    label: str  # "Día A (Entrenamiento)" / "Día B (Descanso)"
    total_calories: float
    target_calories: float
    meals: list[RecipeDTO]

class ClinicalFlags(BaseModel):
    metabolic_syndrome_risk: bool = False
    low_fodmap_active: bool = False
    glp1_safety_mode: bool = False
    blocked_ingredients: list[str] = []

class GeneratePlanResponse(BaseModel):
    patient_name: str
    patient_id: str
    tmb: float
    daily_energy_requirement: float
    archetype_label: str
    clinical_flags: ClinicalFlags
    plan: list[DayPlan]
    llm_narrative: str = ""  # Texto redactado por la IA para presentación

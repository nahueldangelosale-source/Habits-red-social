from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class NutritionLogisticsCode(str, Enum):
    nut_log_market_1 = "nut_log_market_1"
    nut_log_market_2_3 = "nut_log_market_2_3"
    nut_log_market_app = "nut_log_market_app"
    nut_log_kitchen_hate = "nut_log_kitchen_hate"
    nut_log_kitchen_basic = "nut_log_kitchen_basic"
    nut_log_kitchen_chef = "nut_log_kitchen_chef"

class NutritionGoalCode(str, Enum):
    nut_goal_size_down = "nut_goal_size_down"
    nut_goal_energy = "nut_goal_energy"
    nut_goal_digestion = "nut_goal_digestion"
    nut_goal_longevity = "nut_goal_longevity"

class NutritionObstacleCode(str, Enum):
    nut_obs_bored = "nut_obs_bored"
    nut_obs_night_anxiety = "nut_obs_night_anxiety"
    nut_obs_shopping = "nut_obs_shopping"
    nut_obs_no_support = "nut_obs_no_support"

class ClinicalNutritionCode(str, Enum):
    nut_diet_none = "nut_diet_none"
    nut_diet_vegetarian = "nut_diet_vegetarian"
    nut_diet_vegan = "nut_diet_vegan"
    nut_diet_keto = "nut_diet_keto"
    nut_sym_bloating = "nut_sym_bloating"
    nut_sym_headache = "nut_sym_headache"
    nut_sym_fatigue = "nut_sym_fatigue"

class NutritionReadinessCode(str, Enum):
    nut_change_action = "nut_change_action"
    nut_change_contemplation = "nut_change_contemplation"
    nut_change_pre_contemplation = "nut_change_pre_contemplation"

class OnboardingData(BaseModel):
    service_type: Optional[str] = None
    
    # TRAINING FIELDS
    goal: Optional[str] = None
    biometric_tags: List[str] = Field(default_factory=list)
    clinical_tags: List[str] = Field(default_factory=list)
    habit_tags: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = None
    session_time: Optional[str] = None
    environment: Optional[str] = None
    days_per_week: Optional[int] = None
    
    # NUTRITION FIELDS
    nut_logistics_tags: List[NutritionLogisticsCode] = Field(default_factory=list, description="Etiquetas de frecuencia de compras y relacion con la cocina")
    nut_goals_tags: List[NutritionGoalCode] = Field(default_factory=list, description="Metas principales de nutricion")
    nut_obstacles_tags: List[NutritionObstacleCode] = Field(default_factory=list, description="Barreras psicologicas o logisticas")
    nut_clinical_tags: List[ClinicalNutritionCode] = Field(default_factory=list, description="Restricciones dieteticas severas y sintomatologia")
    nut_readiness_tags: List[NutritionReadinessCode] = Field(default_factory=list, max_length=1, description="Nivel de disposicion al cambio")

    # IDENTITY
    first_name: str
    age: str

class OnboardingB2CSubmit(BaseModel):
    # Identidad
    client_id: Optional[UUID] = None
    first_name: str = Field(..., example="Juan")
    last_name: str = Field(..., example="Pérez")
    email: str = Field(..., example="juan@test.com")
    
    # Datos Físicos
    age: int = Field(..., example=30)
    weight_kg: float = Field(..., example=75.5)
    height_cm: float = Field(..., example=175.0)
    
    # Entrenamiento (Taxonomía Universal)
    training_experience: str = "BEGINNER" # BEGINNER, INTERMEDIATE, ADVANCED
    training_days_available: int = 3
    training_duration_pref: int = 60
    
    # Tags (Closed Lists)
    medical_tags: List[str] = Field(default_factory=list) # [LOWER_BACK_PAIN, KNEE_INJURY, etc]
    goal_tags: List[str] = Field(default_factory=list)    # [HIPERTROFIA, STRENGTH, etc]
    
    # Hábitos & Estrés
    habit_sleep_quality: int = 3 # 1-5
    habit_stress_level: int = 3  # 1-5 (Rematado de stressLevel)
    habit_work_type: str = "SEDENTARY" # SEDENTARY, ACTIVE
    
    # Legacy / Compatibility
    equipment: Optional[str] = "none"
    injuries: Optional[str] = "none"
    videoUrl: Optional[str] = None
    
    # PT Extensions
    coaching_preference: Optional[str] = None
    preferred_shift: Optional[str] = None

class AthleteDraftResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    client_id: UUID
    status: str
    risk_score: str
    created_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True

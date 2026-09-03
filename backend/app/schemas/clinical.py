from pydantic import BaseModel, Field
from typing import Literal
from enum import Enum
from app.models.archetype import ActivityLevel, ArchetypeCategory

class GutHealthStatus(str, Enum):
    OPTIMAL = "optimal"
    MILD_DISCOMFORT = "mild_discomfort"
    SEVERE_DYSBIOSIS = "severe_dysbiosis"
    OTHER_UNSPECIFIED = "other_unspecified"

class SymptomCategory(str, Enum):
    FATIGUE = "fatigue"
    JOINT_PAIN = "joint_pain"
    SLEEP_ISSUES = "sleep_issues"
    DIGESTIVE = "digestive"
    OTHER_UNSPECIFIED = "other_unspecified"

class PatientView(BaseModel):
    pedagogical_copy: str = Field(..., description="Copy pedagógico adaptado al paciente")
    education_pill: str = Field(..., description="Píldora educativa sobre la fisiología")
    actionable_habit: str = Field(..., description="Hábito o acción mitigante a ejecutar")

class ProfessionalView(BaseModel):
    diagnosis: str = Field(..., description="Diagnóstico técnico del especialista")
    ui_directive: Literal['clinical-accent', 'risk-high', 'clinical-muted'] = Field(
        ..., description="Directiva visual para el componente de UI (Zero-Trust rendering)"
    )

class CognitiveTranslationPayload(BaseModel):
    biomarker: str = Field(..., description="Nombre técnico del biomarcador")
    raw_value: float = Field(..., description="Valor crudo extraído (ej. glucosa en mg/dL)")
    status: Literal['High', 'Low', 'Optimal'] = Field(..., description="Estado clínico estricto")
    professional_view: ProfessionalView
    patient_view: PatientView

from typing import Optional, List
from uuid import UUID
from pydantic import EmailStr

class PatientClinicalRegister(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    age: Optional[int] = Field(None, ge=15, le=100)
    weight_kg: Optional[float] = Field(None, ge=30.0, le=300.0)
    height_cm: Optional[float] = Field(None, ge=100.0, le=250.0)
    waist_cm: Optional[float] = Field(None, ge=40.0, le=200.0)
    gender: Optional[str] = Field(None, max_length=20)
    activity_level: Optional[ActivityLevel] = None
    archetype: Optional[ArchetypeCategory] = None
    symptoms: Optional[List[SymptomCategory]] = Field(default_factory=list)
    clinical_hard_stops: Optional[List[str]] = Field(default_factory=list)
    gut_health: Optional[GutHealthStatus] = None
    medication_glp1: Optional[bool] = None
    meal_schedule: Optional[str] = Field(None, max_length=100)
    tenant_id: Optional[UUID] = None
    schema_version: int = Field(default=1, description="Versionado del esquema JSONB para evitar anarquía")

class AthleteProfile(BaseModel):
    id: str = Field(..., description="UUID del atleta")
    tenant_id: str = Field(..., description="UUID del tenant")
    injuries: List[str] = Field(default_factory=list, description="IDs de lesiones (ej. INJ_SHLD_01)")
    session_location: Literal["Gym", "Home", "Outdoor"] = Field(default="Gym", description="Lugar de entrenamiento")
    cns_fatigue_score: Literal["LOW", "MODERATE", "HIGH"] = Field(default="LOW", description="Fatiga del Sistema Nervioso Central (1-3)")

class CleanWorkoutItem(BaseModel):
    id: str
    exercise_id: str
    official_name: str
    sets: str
    reps: str
    rpe: str
    weight: str
    axial_load: bool = Field(False, description="Carga axial sobre la columna")
    movement_pattern: str = Field("", description="Patrón de movimiento")

class BiomechanicalSwapResult(BaseModel):
    original_exercise_id: str
    original_name: str
    new_exercise_id: str
    new_name: str
    clinical_rationale: str = Field(..., description="Explicación XAI para el entrenador B2B")
    is_swapped: bool = Field(True, description="Indica si hubo una sustitución")

class CleanWorkoutDay(BaseModel):
    day_name: str
    items: List[CleanWorkoutItem]
    swaps: List[BiomechanicalSwapResult] = Field(default_factory=list)

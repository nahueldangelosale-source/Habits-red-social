from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class WorkoutItemSchema(BaseModel):
    id: str = Field(..., description="Unique ID for the item")
    exercise: dict = Field(..., description="Taxonomía del ejercicio")
    sets: str = Field(default="0", description="Número de series")
    reps: str = Field(default="0", description="Número de repeticiones")
    weight: str = Field(default="0", description="Carga en kg o lbs")
    rpe: str = Field(default="0", description="Rate of Perceived Exertion (0-10)")
    videoUrl: Optional[str] = Field(default="", description="Enlace a video demostrativo")
    progression: Optional[str] = Field(default="", description="Nota de progresión")

class WorkoutDaySchema(BaseModel):
    id: str = Field(..., description="Unique ID for the workout day")
    name: str = Field(..., description="Nombre de la sesión o día (ej. Día 1: Empuje)")
    items: List[WorkoutItemSchema] = Field(default_factory=list, description="Lista de ejercicios. Vacío si es día de descanso.")

class ProtocolContentSchema(BaseModel):
    days: List[WorkoutDaySchema] = Field(default_factory=list, description="Días de entrenamiento del mesociclo")
    nutrition: dict = Field(default_factory=dict, description="Configuración nutricional (macros/targets)")
    telemetry: dict = Field(default_factory=dict, description="Métricas calculadas del plan")
    dates: dict = Field(default_factory=dict, description="Fechas de inicio y fin")

class ProtocolCreateSchema(BaseModel):
    client_id: str
    type: str = Field(..., description="DIET, ROUTINE, or CLINICAL_PROTOCOL")
    name: str
    description: Optional[str] = None
    content: ProtocolContentSchema

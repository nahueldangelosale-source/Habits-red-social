from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from uuid import UUID
from datetime import datetime
from app.db.models import MuscleGroup

class ExerciseTemplateBase(BaseModel):
    name: str = Field(..., description="Nombre del ejercicio biomecánico")
    primary_muscle_group: MuscleGroup = Field(..., description="Grupo muscular primario aislado")
    axial_load: bool = Field(False, description="True si el ejercicio genera compresión en la columna (carga axial)")
    is_glp1_safe: bool = Field(True, description="True si el ejercicio es óptimo para pacientes con atrofia sarcopénica inducida por GLP-1")
    contraindications: List[str] = Field(default_factory=list, description="Lista de condiciones clínicas contraindicadas")
    aurea_metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata dinámica para el motor AUREA RAG")

class ExerciseTemplateCreate(ExerciseTemplateBase):
    pass

class ExerciseTemplateRead(ExerciseTemplateBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

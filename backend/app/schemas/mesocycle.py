from pydantic import BaseModel, Field, UUID4
from typing import List, Optional, Any, Dict

class BlockItemSchema(BaseModel):
    id: str
    type: str = Field(..., description="'EXERCISE' or 'BLOCK'")
    exercise_id: Optional[str] = None
    block_id: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    rpe: Optional[str] = None
    is_swapped: Optional[bool] = False
    clinical_rationale: Optional[str] = None
    # For sub-items in blocks
    items: Optional[List['BlockItemSchema']] = None

class DaySchema(BaseModel):
    id: str
    name: str
    items: List[BlockItemSchema] = Field(default_factory=list)

class RoutineStructureSchema(BaseModel):
    days: List[DaySchema] = Field(default_factory=list)
    version: int = 1

class MesocycleCreateSchema(BaseModel):
    client_id: UUID4
    taxonomy_id: str
    name: str
    routine_structure: RoutineStructureSchema
    nutrition_plan: Optional[Dict[str, Any]] = None
    telemetry_snapshot: Optional[Dict[str, Any]] = None

class MesocycleResponseSchema(BaseModel):
    id: UUID4
    tenant_id: UUID4
    client_id: UUID4
    coach_id: UUID4
    taxonomy_id: str
    name: str
    routine_structure: RoutineStructureSchema
    version: int
    is_active: bool

    class Config:
        from_attributes = True

# Resolve forward references
BlockItemSchema.model_rebuild()

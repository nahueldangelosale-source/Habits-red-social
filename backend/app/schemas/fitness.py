"""
Fitnes schemas for WorkoutBuilder
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# =============================================================================
# BASE SCHEMAS
# =============================================================================

class ExerciseTargetBase(BaseModel):
    exercise_id: UUID
    order: int
    sets: int
    reps: Optional[int] = None
    rpe: Optional[int] = Field(None, ge=1, le=10)
    weight: Optional[float] = None
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None
    
    model_config = ConfigDict(strict=True)

class SupersetGroupBase(BaseModel):
    order: int
    notes: Optional[str] = None
    
    model_config = ConfigDict(strict=True)

class WorkoutDayBase(BaseModel):
    name: str
    order: int
    
    model_config = ConfigDict(strict=True)

class WorkoutPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    
    model_config = ConfigDict(strict=True)


# =============================================================================
# CREATE SCHEMAS
# =============================================================================

class ExerciseTargetCreate(ExerciseTargetBase):
    pass

class SupersetGroupCreate(SupersetGroupBase):
    exercises: List[ExerciseTargetCreate] = Field(default_factory=list)

class WorkoutDayCreate(WorkoutDayBase):
    supersets: List[SupersetGroupCreate] = Field(default_factory=list)

class WorkoutPlanCreate(WorkoutPlanBase):
    client_id: UUID
    days: List[WorkoutDayCreate] = Field(default_factory=list)


# =============================================================================
# READ SCHEMAS (ORM Mode)
# =============================================================================

class ExerciseTargetRead(ExerciseTargetBase):
    id: UUID
    superset_group_id: UUID
    tenant_id: UUID
    
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    
    model_config = ConfigDict(strict=True, from_attributes=True)

class SupersetGroupRead(SupersetGroupBase):
    id: UUID
    day_id: UUID
    tenant_id: UUID
    exercises: List[ExerciseTargetRead] = Field(default_factory=list)
    
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    
    model_config = ConfigDict(strict=True, from_attributes=True)

class WorkoutDayRead(WorkoutDayBase):
    id: UUID
    plan_id: UUID
    tenant_id: UUID
    supersets: List[SupersetGroupRead] = Field(default_factory=list)
    
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    
    model_config = ConfigDict(strict=True, from_attributes=True)

class WorkoutPlanRead(WorkoutPlanBase):
    id: UUID
    tenant_id: UUID
    professional_id: UUID
    client_id: UUID
    days: List[WorkoutDayRead] = Field(default_factory=list)
    
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    delivery_status: Optional[str] = None
    
    model_config = ConfigDict(strict=True, from_attributes=True)


# =============================================================================
# UPDATE SCHEMAS
# =============================================================================

class ExerciseTargetUpdate(BaseModel):
    order: Optional[int] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    rpe: Optional[int] = Field(None, ge=1, le=10)
    weight: Optional[float] = None
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None
    
    model_config = ConfigDict(strict=True)

class SupersetGroupUpdate(BaseModel):
    order: Optional[int] = None
    notes: Optional[str] = None
    
    model_config = ConfigDict(strict=True)

class WorkoutDayUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None
    
    model_config = ConfigDict(strict=True)

class WorkoutPlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_deleted: Optional[bool] = None
    delivery_status: Optional[str] = None
    
    model_config = ConfigDict(strict=True)

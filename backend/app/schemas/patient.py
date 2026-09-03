from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict

class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[datetime] = None
    height_cm: Optional[float] = Field(None, gt=0)
    goal: Optional[str] = None
    extra_data: Optional[dict] = Field(default_factory=dict, description="Polymorphic fields (e.g. medical_tags, service_type)")

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[datetime] = None
    height_cm: Optional[float] = Field(None, gt=0)
    goal: Optional[str] = None

class PatientOut(PatientBase):
    id: UUID
    tenant_id: UUID
    professional_id: Optional[UUID] = None
    is_active: bool
    coaching_status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PatientListOut(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[PatientOut]

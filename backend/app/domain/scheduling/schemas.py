from pydantic import BaseModel, Field, UUID4
from datetime import datetime
from typing import Optional

class ReservationCreate(BaseModel):
    session_id: UUID4
    idempotency_key: str = Field(..., max_length=36)
    billing_reference_id: Optional[str] = None

class ReservationResponse(BaseModel):
    id: UUID4
    session_id: UUID4
    user_id: UUID4
    status: str
    idempotency_key: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClassSessionResponse(BaseModel):
    id: UUID4
    resource_id: UUID4
    name: str
    start_time: datetime
    end_time: datetime
    max_capacity: int
    current_capacity: int
    version: int

    class Config:
        from_attributes = True

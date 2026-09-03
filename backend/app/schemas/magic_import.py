from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field, validator
import uuid

class AthleteImportSchema(BaseModel):
    """
    Schema estricto para validar cada fila del CSV/API de importación mágica.
    """
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    whatsapp_id: Optional[str] = None
    
    # Datos biométricos
    birth_date: Optional[datetime] = None
    height_cm: Optional[float] = Field(None, gt=0, lt=300)
    weight_kg: Optional[float] = Field(None, gt=0, lt=500)
    
    # Extra data JSONB field
    extra_data: dict = Field(default_factory=dict)
    
    @validator('email', pre=True)
    def normalize_email(cls, v):
        if isinstance(v, str):
            return v.lower().strip()
        return v
    
    @validator('first_name', 'last_name', pre=True)
    def normalize_names(cls, v):
        if isinstance(v, str):
            return v.strip().title()
        return v

class MagicImportResponse(BaseModel):
    total_processed: int
    success_count: int
    quarantine_count: int
    message: str

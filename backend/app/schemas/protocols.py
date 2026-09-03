from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.db.models import ProtocolType

class ProtocolCreate(BaseModel):
    client_id: UUID
    type: ProtocolType
    name: str
    description: Optional[str] = None
    content: Dict[str, Any]

class ProtocolResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    professional_id: UUID
    client_id: UUID
    type: ProtocolType
    name: str
    description: Optional[str]
    content: Dict[str, Any]
    version: int
    status: str

    model_config = ConfigDict(from_attributes=True)

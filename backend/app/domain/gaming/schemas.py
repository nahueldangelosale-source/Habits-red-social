from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime
import uuid

class GamingEventIngress(BaseModel):
    event_id: uuid.UUID = Field(..., description="UUIDv4 único para deduplicación idempotente")
    user_id: uuid.UUID
    tenant_id: uuid.UUID
    action_type: str = Field(..., examples=["WORKOUT_COMPLETED", "ATTENDANCE_CHECK_IN"])
    
    # El timestamp del servidor al recibir el evento
    server_timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Datos obligatorios dentro del contexto pasivo para control offline
    context: Dict[str, Any] = Field(
        ..., 
        description="Contenedor libre de esquema para telemetría pasiva y auditoría anti-fraude"
    )

    class Config:
        frozen = True  # Inmutabilidad del objeto durante el ciclo de vida de la petición

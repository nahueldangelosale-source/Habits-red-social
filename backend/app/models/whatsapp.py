"""
Modelos Pydantic para WhatsApp Business API
Define estructuras para mensajes entrantes y salientes.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# =============================================================================
# WHATSAPP BUSINESS API MODELS
# =============================================================================

class WhatsAppMessageType(str, Enum):
    """Tipos de mensaje de WhatsApp."""
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    DOCUMENT = "document"
    LOCATION = "location"
    CONTACTS = "contacts"
    INTERACTIVE = "interactive"
    BUTTON = "button"


class WhatsAppTextMessage(BaseModel):
    """Contenido de mensaje de texto."""
    body: str


class WhatsAppContact(BaseModel):
    """Información de contacto."""
    wa_id: str
    profile: Optional[dict] = None


class WhatsAppMessage(BaseModel):
    """Mensaje entrante de WhatsApp."""
    from_: str = Field(..., alias="from")
    id: str
    timestamp: str
    type: WhatsAppMessageType
    text: Optional[WhatsAppTextMessage] = None
    
    class Config:
        populate_by_name = True


class WhatsAppWebhookEntry(BaseModel):
    """Entry del webhook de WhatsApp."""
    id: str
    changes: list[dict]


class WhatsAppWebhookPayload(BaseModel):
    """Payload completo del webhook."""
    object: str
    entry: list[WhatsAppWebhookEntry]


# =============================================================================
# INTERNAL MODELS
# =============================================================================

class IncomingMessage(BaseModel):
    """Mensaje procesado internamente."""
    id: str
    phone_number: str
    text: str
    type: WhatsAppMessageType
    received_at: datetime
    tenant_id: Optional[UUID] = None
    client_id: Optional[UUID] = None


class OutgoingMessage(BaseModel):
    """Mensaje a enviar."""
    to: str  # Número de teléfono
    type: WhatsAppMessageType = WhatsAppMessageType.TEXT
    text: WhatsAppTextMessage
    messaging_product: str = "whatsapp"


class ConversationLog(BaseModel):
    """Log de conversación para auditoría."""
    id: UUID
    tenant_id: UUID
    client_phone: str
    professional_id: Optional[UUID] = None
    incoming_message: str
    outgoing_message: str
    intent_detected: str
    risk_level: str
    was_automated: bool
    professional_alerted: bool
    created_at: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# ALERT MODELS
# =============================================================================

class ProfessionalAlert(BaseModel):
    """Alerta enviada al profesional."""
    professional_id: UUID
    client_phone: str
    client_name: Optional[str] = None
    alert_type: str  # "emergency", "high_risk", "needs_attention"
    original_message: str
    triggered_patterns: list[str]
    priority: str = "high"
    created_at: datetime = Field(default_factory=datetime.utcnow)

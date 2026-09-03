import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Index, Text, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import UniqueConstraint

from app.db.base_class import Base

class NotificationDigestLog(Base):
    """
    Registro de idempotencia y trazabilidad de los Daily Digests enviados a Coaches.
    Mide apertura (Open Rate) y conversión del CTA (Click Rate).
    """
    __tablename__ = "notification_digest_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    coach_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    # Target date for idempotency (so we only send 1 digest per coach per day)
    target_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    
    # STATUS: PENDING, SENT, FAILED
    status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False)
    
    # Payload enviado al enrutador (Knock/Courier)
    payload_jsonb: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    provider_id: Mapped[str] = mapped_column(String(255), nullable=True) # ID from Knock/Courier
    
    # Tracking
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    clicked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint('coach_id', 'target_date', name='uq_digest_coach_date'),
        Index("ix_notif_digest_coach_date", "coach_id", "target_date"),
    )

class CoachCommunicationState(Base):
    """
    Máquina de estados Anti-Spam para Coaches.
    Gestiona el "Stop-Loss" de notificaciones si no hay interacción (Open Rate = 0).
    """
    __tablename__ = "coach_communication_states"

    coach_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    # Estados: ACTIVE, WARNING, COOLING_DOWN, SILENCED
    state: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    
    # Racha de envíos sin apertura
    unopened_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    cooldown_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

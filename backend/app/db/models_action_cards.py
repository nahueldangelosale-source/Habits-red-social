import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Integer, Float, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class ActionCardTemplate(Base):
    __tablename__ = "action_card_templates"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True) # e.g. CHURN_RISK_ABSENCE
    trigger_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. CHURN_RISK, STREAK_ACHIEVED
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    content_template: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence_base: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

class ActionCard(Base):
    __tablename__ = "action_cards"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    coach_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    athlete_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    template_id: Mapped[str] = mapped_column(String(50), ForeignKey("action_card_templates.id"), nullable=False)
    context_payload: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    
    # Status: PENDING_REVIEW, APPROVED (Sent to WhatsApp), REJECTED, DISMISSED
    status: Mapped[str] = mapped_column(String(20), default="PENDING_REVIEW", nullable=False)
    priority_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    
    # Feedback loop
    was_useful: Mapped[bool] = mapped_column(Integer, nullable=True) # 1 for True, 0 for False
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_action_cards_coach_status", "coach_id", "status"),
    )

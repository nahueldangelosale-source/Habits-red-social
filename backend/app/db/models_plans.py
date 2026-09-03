from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timedelta, timezone

from app.db.database import Base

def get_default_expiration():
    return datetime.now(timezone.utc) + timedelta(days=14)

class PlanDraft(Base):
    """
    Storage for volatile plan builder drafts using JSONB.
    Auto-saves from frontend land here to prevent data loss.
    """
    __tablename__ = "plan_drafts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    state_hash = Column(String(64), nullable=False)
    payload = Column(JSONB, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), default=get_default_expiration)

    # Relationships
    tenant = relationship("Tenant")
    trainer = relationship("User", foreign_keys=[trainer_id])
    athlete = relationship("User", foreign_keys=[athlete_id])


class AnalyticsAthleteWorkload(Base):
    """
    O(1) read-optimized table for Churn Risk Index (CRI) engine.
    Stores the body part volume calculations snapshot when a plan is committed.
    """
    __tablename__ = "analytics_athlete_workload"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    protocol_id = Column(UUID(as_uuid=True), ForeignKey("protocols.id", ondelete="CASCADE"), nullable=False)
    
    workload_data = Column(JSONB, nullable=False) # e.g. {"Pectoral": 12, "Cuádriceps": 22}
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    tenant = relationship("Tenant")
    athlete = relationship("User", foreign_keys=[athlete_id])

# Indices defined explicitly at table level instead of inside the class for clarity
Index('idx_plan_drafts_expires_at', PlanDraft.expires_at)
Index('idx_analytics_workload_athlete', AnalyticsAthleteWorkload.athlete_id)

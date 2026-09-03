import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.connection import Base

class ActionCardStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONTACTED = "CONTACTED"
    RESOLVED = "RESOLVED"
    IGNORED = "IGNORED"

class ChurnRiskScore(Base):
    __tablename__ = "churn_risk_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    athlete_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    
    score = Column(Integer, nullable=False) # 0 - 100
    
    # Meta variables that caused this score for audit purposes
    context_snapshot = Column(JSONB, nullable=True) 
    
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class CoachingInterventionTrigger(Base):
    __tablename__ = "coaching_intervention_triggers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    athlete_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    
    intervention_type = Column(String, nullable=False) # e.g., ACWR_PREVENTIVE_RECOVERY
    
    # Snapshot del contexto (e.g. número de rutinas completadas hoy)
    context_snapshot = Column(JSONB, nullable=True) 
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class ActionCard(Base):
    __tablename__ = "action_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    professional_id = Column(UUID(as_uuid=True), index=True, nullable=True)
    athlete_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    
    # Foreign keys a la fuente del trigger (Polimorfismo mitigado con Nullable FKs)
    risk_score_id = Column(UUID(as_uuid=True), ForeignKey("churn_risk_scores.id"), nullable=True)
    intervention_trigger_id = Column(UUID(as_uuid=True), ForeignKey("coaching_intervention_triggers.id"), nullable=True)
    
    # Agnostic Notification Payload fields (Adapter Pattern)
    title = Column(String, nullable=False)
    body_template = Column(String, nullable=False)
    context_variables = Column(JSONB, nullable=False) # The variables to inject into the template
    
    status = Column(SQLEnum(ActionCardStatus), default=ActionCardStatus.PENDING, nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_action_cards_tenant_pt_status', 'tenant_id', 'professional_id', 'status'),
    )

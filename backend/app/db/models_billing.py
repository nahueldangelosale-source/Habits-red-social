import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Integer, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class FeatureCapability(Base):
    __tablename__ = "feature_capabilities"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True) # e.g. ADVANCED_ROI_DASHBOARD
    description: Mapped[str] = mapped_column(String(255), nullable=True)

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True) # e.g. PLG_FREE, PRO, ENTERPRISE
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price_monthly: Mapped[int] = mapped_column(Integer, default=0, nullable=False) # In cents
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)

class PlanCapabilityLink(Base):
    __tablename__ = "plan_capability_links"
    
    plan_id: Mapped[str] = mapped_column(String(50), ForeignKey("subscription_plans.id", ondelete="CASCADE"), primary_key=True)
    capability_id: Mapped[str] = mapped_column(String(50), ForeignKey("feature_capabilities.id", ondelete="CASCADE"), primary_key=True)

class TenantSubscription(Base):
    __tablename__ = "tenant_subscriptions"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    plan_id: Mapped[str] = mapped_column(String(50), ForeignKey("subscription_plans.id"), nullable=False)
    
    # Status: TRIALING, ACTIVE, PAST_DUE, CANCELED
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    
    current_period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    __table_args__ = (
        UniqueConstraint('tenant_id', name='uq_tenant_subscription'),
        Index("ix_tenant_subscription_tenant_id", "tenant_id"),
    )

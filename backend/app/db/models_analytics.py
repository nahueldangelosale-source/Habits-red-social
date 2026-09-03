import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Index, Text, Integer, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base

class GrowthEventTrack(Base):
    """
    Append-Only table for telemetry and growth events (Squad joins, invites, cheers).
    Partitioned by RANGE (created_at) per month for scalable performance.
    """
    __tablename__ = "growth_event_tracks"
    __table_args__ = (
        Index("ix_growth_events_squad_type", "squad_id", "event_type"),
        Index("ix_growth_events_created", "created_at"),
        {'postgresql_partition_by': 'RANGE (created_at)'}
    )

    # Note: In a partitioned table, the partition key (created_at) MUST be part of the primary key
    # if there is a primary key constraint, or we can omit the PK constraint.
    # We will omit the primary key constraint here to allow Postgres partitioning to work smoothly.
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True, default=datetime.utcnow, nullable=False)
    
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    squad_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    actor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    target_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    
    event_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. 'invite_sent', 'invite_accepted', 'cheer_sent'
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

# The materialized views (mv_squad_viral_k_factor, mv_squad_engagement_score, mv_squad_churn_predictor)
# are not typically mapped as standard SQLAlchemy Base models if they are read-only and refreshed by cron,
# but we can query them directly or map them if needed. For the B2B dashboard, we will query them directly via core or raw SQL.

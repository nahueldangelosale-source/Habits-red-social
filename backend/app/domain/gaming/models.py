import uuid
from datetime import datetime
from sqlalchemy import Integer, DateTime, Index, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base

class ScoreCardVault(Base):
    """
    Bóveda inmutable para los puntos de experiencia de los atletas.
    Resistente a desvíos cronológicos (Late Sync) gracias a last_client_timestamp.
    """
    __tablename__ = "scorecard_vault"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    
    total_xp: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    current_level: Mapped[int] = mapped_column(Integer, default=1, server_default="1")
    
    # Blindaje de Idempotencia y Ordenamiento
    last_event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    # Registra el timestamp real del dispositivo para resolver conflictos cronológicos
    last_client_timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Auditoría del Sistema usando el reloj de PostgreSQL (Evita desfases de pods)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Índice compuesto para optimizar las queries de Leaderboards por Tenant
    __table_args__ = (
        Index("ix_gaming_tenant_xp", "tenant_id", "total_xp", postgresql_using="btree"),
    )

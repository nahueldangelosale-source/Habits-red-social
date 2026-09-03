"""
Bienestar APP - InterventionAuditVault
Bóveda de Auditoría para Intervenciones Profesionales.
Append-Only Event Log: INSERT ONLY enforceado a nivel ORM.
Registra cada acción de un profesional sobre un cliente (1-click approval).
"""

import uuid as uuid_pkg

from sqlalchemy import Column, String, Integer, DateTime, event
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.sql import func

from app.db.connection import Base


class InterventionAuditVault(Base):
    """
    Bóveda de Auditoría para Intervenciones Profesionales.
    Append-Only: INSERT ONLY enforceado a nivel ORM (Zero-Trust).
    Cada registro es inmutable una vez persistido.
    """

    __tablename__ = "intervention_audit_vault"

    id = Column(Integer, primary_key=True, autoincrement=True)
    intervention_id = Column(
        PG_UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid_pkg.uuid4,
    )
    professional_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    client_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    tenant_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    action_type = Column(String, nullable=False)
    payload = Column(JSONB, nullable=False)
    reasoning = Column(String, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ─── Seguridad por Diseño: INSERT ONLY ──────────────────────────────────────

@event.listens_for(InterventionAuditVault, "before_update")
def prevent_update(mapper, connection, target):
    raise Exception(
        "SECURITY_VIOLATION: InterventionAuditVault es INSERT ONLY. "
        "Las modificaciones están estrictamente prohibidas por Diseño Zero-Trust."
    )


@event.listens_for(InterventionAuditVault, "before_delete")
def prevent_delete(mapper, connection, target):
    raise Exception(
        "SECURITY_VIOLATION: InterventionAuditVault es INSERT ONLY. "
        "Las eliminaciones están estrictamente prohibidas por Diseño Zero-Trust."
    )

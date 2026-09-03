from sqlalchemy import Column, String, Integer, DateTime, JSON, event
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import validates
from app.db.connection import Base

class M2MAuditVault(Base):
    """
    Bóveda M2M (Machine-to-Machine).
    Append-Only Event Log for CQRS/Event Sourcing.
    Standard 2026 Auditability Pattern. INSERT ONLY enforceado a nivel ORM.
    """
    __tablename__ = "clinical_m2m_audit_vault"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(PG_UUID, unique=True, nullable=False)
    aggregate_id = Column(PG_UUID, index=True, nullable=False)
    aggregate_type = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    version = Column(Integer, nullable=False)
    payload = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False)

# Seguridad por Diseño: Evitar UPDATE a nivel ORM
@event.listens_for(M2MAuditVault, 'before_update')
def receive_before_update(mapper, connection, target):
    raise Exception("SECURITY_VIOLATION: Bóveda M2M es INSERT ONLY. Las modificaciones están estrictamente prohibidas por Diseño Zero-Trust.")

# Seguridad por Diseño: Evitar DELETE a nivel ORM
@event.listens_for(M2MAuditVault, 'before_delete')
def receive_before_delete(mapper, connection, target):
    raise Exception("SECURITY_VIOLATION: Bóveda M2M es INSERT ONLY. Las eliminaciones están estrictamente prohibidas por Diseño Zero-Trust.")


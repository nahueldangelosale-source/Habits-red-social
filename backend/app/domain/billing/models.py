import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base

class Subscription(Base):
    """
    Suscripción B2B de un Tenant (Gimnasio/Clínica).
    """
    __tablename__ = "billing_subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, unique=True)
    status = Column(String, default="ACTIVE", nullable=False) # ACTIVE, PAST_DUE, CANCELED
    tier = Column(String, default="TIER_1", nullable=False) # TIER_1 (up to 100 athletes), TIER_2 (up to 500)
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

class Invoice(Base):
    """
    Intención de cobro / Recibo. Ligada a una reserva para el flujo B2C O2O.
    """
    __tablename__ = "billing_invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reservation_id = Column(UUID(as_uuid=True), nullable=True) # Ligado a scheduling_reservations
    
    amount_cents = Column(BigInteger, nullable=False)
    currency = Column(String(3), nullable=False, default="ARS")
    
    status = Column(String, default="PENDING", nullable=False) # PENDING, PAID, FAILED, REFUNDED
    provider_payment_id = Column(String, nullable=True) # MercadoPago Payment ID
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

class LedgerEntry(Base):
    """
    Libro Mayor Inmutable (Append-Only).
    Ninguna fila en esta tabla sufre un UPDATE o DELETE.
    """
    __tablename__ = "billing_ledger_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # BIGINT para prevenir overflow de enteros en entornos de alta transaccionalidad
    amount_cents = Column(BigInteger, nullable=False)
    currency = Column(String(3), nullable=False, default="ARS")
    
    # Tipo de Asiento: RESERVATION_FEE, PAYOUT, CHARGEBACK, REFUND
    reference_type = Column(String, nullable=False)
    reference_id = Column(UUID(as_uuid=True), nullable=False) # Ej. invoice_id, payout_id
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

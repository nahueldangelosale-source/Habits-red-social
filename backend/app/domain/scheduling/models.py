from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.db.connection import Base

class Resource(Base):
    __tablename__ = "scheduling_resources"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    capacity = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class ClassSession(Base):
    __tablename__ = "scheduling_class_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(UUID(as_uuid=True), ForeignKey("scheduling_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    
    name = Column(String(255), nullable=False)
    # Strict UTC timestamps
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    
    max_capacity = Column(Integer, nullable=False)
    current_capacity = Column(Integer, nullable=False, default=0)
    
    # Optimistic Locking version column
    version = Column(Integer, nullable=False, default=1)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __mapper_args__ = {
        "version_id_col": version
    }

class Reservation(Base):
    __tablename__ = "scheduling_reservations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("scheduling_class_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    # Using String for user_id to match rbac logic or UUID if we have a strict relation, 
    # but we will use UUID assuming users table uses UUID.
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Idempotency and EDA hooks
    idempotency_key = Column(String(36), unique=True, index=True, nullable=False)
    status = Column(String(50), nullable=False, default="BOOKED") # BOOKED, ATTENDED, NO_SHOW, CANCELLED
    
    # Billing hook (Phase 44)
    billing_reference_id = Column(String(255), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

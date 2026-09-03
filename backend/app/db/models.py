"""

Bienestar APP - Modelos de Base de Datos

Entidades core del sistema multi-tenant para wellness profesionales.

Arquitectura:

- Tenant â Profesionales â Clientes â Protocolos

- JSONB para datos flexibles (dietas, rutinas)

- pgvector para bÃºsqueda semÃ¡ntica de protocolos

"""

import uuid

from datetime import datetime

from enum import Enum as PyEnum

from typing import Optional

from sqlalchemy import (
    Column,
    DateTime,
    Date,
    Numeric,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
    Boolean,
    Integer,
    BigInteger,
    Float,
    func
)

from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY

from sqlalchemy.orm import relationship, Mapped, mapped_column

from pgvector.sqlalchemy import Vector

from app.db.connection import Base

from app.db.rbac import User, UserRole

# =============================================================================

# ENUMS

# =============================================================================

class ProfessionalSpecialty(str, PyEnum):

    """Especialidad del profesional de bienestar."""

    FITNESS = "FITNESS"

    NUTRITION = "NUTRITION"

    HYBRID = "HYBRID"

class ProtocolType(str, PyEnum):

    """Tipo de protocolo asignado al cliente."""

    DIET = "DIET"

    ROUTINE = "ROUTINE"

    CLINICAL_PROTOCOL = "CLINICAL_PROTOCOL"

class ProtocolStatus(str, PyEnum):

    """Estado del protocolo para la Inmutabilidad ClÃ­nica."""

    DRAFT = "DRAFT"

    ACTIVE = "ACTIVE"

    ARCHIVED = "ARCHIVED"

class ClientExtraFlags(str, PyEnum):

    """Flags especiales que viven dentro de Client.extra_data (JSONB)"""

    IS_GHOST_PERSONA = "is_ghost_persona"

class ActivePlanStatus(str, PyEnum):

    """Estado del plan activo para el Protocol Rebase Pattern."""

    ACTIVE = "ACTIVE"

    CONFLICT_PENDING = "CONFLICT_PENDING"

    ARCHIVED = "ARCHIVED"

class SyncStatus(str, PyEnum):

    """Estado de sincronizaciÃ³n para offline-first."""

    SYNCED = "synced"

    PENDING = "pending"

    CONFLICT = "conflict"

class PaymentStatus(str, PyEnum):

    """Estado de pago del cliente."""

    ACTIVE = "active"             # Al dÃ­a (Split o Cash)

    PAST_DUE = "past_due"         # Vencido

    MANUAL_OVERRIDE = "manual"    # Pago en efectivo (Pro-managed)

    TRIAL = "trial"               # Periodo de prueba

class IntentCategory(str, PyEnum):

    """CategorÃ­a de intenciÃ³n para mensajes pre-procesados por IA (Sovereign Agora)."""

    TRAINING = "training"

    NUTRITION = "nutrition"

    BILLING = "billing"

    GENERAL = "general"

class PlanTier(str, PyEnum):

    """Nivel de suscripciÃ³n del Profesional (SaaS)."""

    FREE = "FREE"

    STARTER = "STARTER"

    PRO = "PRO"

    ELITE = "ELITE"

class SubscriptionTier(str, PyEnum):

    """Nivel de suscripciÃ³n FinOps (MonetizaciÃ³n B2B Phase 18)."""

    FREE = "FREE"

    PRO = "PRO"

class PaymentProvider(str, PyEnum):

    """Proveedores de pago soportados para la FinOps Engine."""

    MERCADO_PAGO = "MERCADO_PAGO"

    STRIPE = "STRIPE"

    NONE = "NONE"

class MuscleGroup(str, PyEnum):

    """Grupos musculares principales para la ontologÃ­a biomecÃ¡nica."""

    CHEST = "CHEST"

    BACK = "BACK"

    LEGS = "LEGS"

    SHOULDERS = "SHOULDERS"

    ARMS = "ARMS"

    CORE = "CORE"

    FULL_BODY = "FULL_BODY"

    CARDIO = "CARDIO"

# =============================================================================

# TENANT (Multi-tenancy)

# =============================================================================

class Tenant(Base):

    """

    OrganizaciÃ³n/Empresa que usa la plataforma.

    Cada tenant tiene sus propios profesionales, clientes y configuraciÃ³n.

    """

    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    # ConfiguraciÃ³n personalizada (colores, saludos WhatsApp, etc.)

    settings: Mapped[dict] = mapped_column(

        JSONB,

        default=dict,

        nullable=False,

        comment="Brand colors, WhatsApp greeting, etc."

    )

    # White-Label Branding (Phase 16 & 49)

    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    primary_color: Mapped[str] = mapped_column(String(7), default="#0f172a", nullable=False)

    secondary_color: Mapped[str] = mapped_column(String(7), default="#3b82f6", nullable=False)

    # LÃ­mites de uso (Revenue Guard - FinOps Quota Engine)

    compute_units_balance: Mapped[int] = mapped_column(BigInteger, default=500000, nullable=False)

    # Stripe Connect

    stripe_account_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Hybrid Revenue Engine (Split Payments)

    mp_access_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Mercado Pago

    subscription_price: Mapped[float] = mapped_column(Float, default=0.0)

    fee_bps: Mapped[int] = mapped_column(Integer, default=1000, nullable=False) # 1000 BPS = 10.0% Take Rate

    currency: Mapped[str] = mapped_column(String(3), default="USD")

    plan_tier: Mapped[str] = mapped_column(

        String(50),

        default=PlanTier.FREE.value,

        nullable=False

    )

    # B2B SaaS Monetization & Glass Walls (Phase 18 - Agnostic Refact)

    subscription_tier: Mapped[str] = mapped_column(

        String(50),

        default=SubscriptionTier.FREE.value,

        nullable=False,

        server_default="FREE"

    )

    payment_provider: Mapped[str] = mapped_column(

        String(50),

        default=PaymentProvider.NONE.value,

        nullable=False,

        server_default="NONE"

    )

    payment_status: Mapped[str] = mapped_column(

        String(50), 

        default="active", 

        nullable=False, 

        server_default="active"

    )

    provider_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    subscription_status: Mapped[str] = mapped_column(String(50), default="active", nullable=False, server_default="active")

    # Legacy compatibility (Deprecated - preferring agnostic provider_subscription_id)

    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Feature Flags B2B (Dark Launch)

    ff_checkout_v2: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(

        DateTime,

        default=datetime.utcnow,

        nullable=False

    )

    updated_at: Mapped[datetime] = mapped_column(

        DateTime,

        default=datetime.utcnow,

        onupdate=datetime.utcnow,

        nullable=False

    )

    # B2B Viral Engine (Phase 17)

    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    referred_by_tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("tenants.id", ondelete="SET NULL"),

        nullable=True

    )

    referral_reward_claimed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relaciones

    professionals = relationship("Professional", back_populates="tenant")

    clients = relationship("Client", back_populates="tenant")

# =============================================================================

# PROFESSIONAL (El Coach/Nutricionista)

# =============================================================================

class Professional(Base):

    """

    Profesional del bienestar que pertenece a un tenant.

    Puede ser fitness coach, nutricionista, o hÃ­brido.

    """

    __tablename__ = "professionals"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("tenants.id", ondelete="CASCADE"),

        nullable=False

    )

    # Auth (Supabase/Clerk vinculado)

    auth_user_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Datos personales

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)

    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[str] = mapped_column(String(255), nullable=False)

    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    specialty: Mapped[str] = mapped_column(

        String(50),

        default=ProfessionalSpecialty.HYBRID.value,

        nullable=False

    )

    role: Mapped[str] = mapped_column(

        String(50),

        default="PT",

        nullable=False,

        comment="ADMIN | PT | RECEPTIONIST | NUTRITIONIST"

    )

    # Revenue Guard B2B

    subscription_status: Mapped[str] = mapped_column(String(50), default="active")

    service_type: Mapped[str] = mapped_column(String(50), default="fitness")

    # Perfil para RAG (WhatsApp Intelligence - Module B)

    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    coaching_style: Mapped[Optional[str]] = mapped_column(

        Text,

        nullable=True,

        comment="DescripciÃ³n del estilo de coaching para RAG"

    )

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime, 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow

    )

    # Relaciones

    tenant = relationship("Tenant", back_populates="professionals")

    clients = relationship("Client", back_populates="professional")

    chart_records = relationship("ChartRecord", back_populates="professional")

    # Ãndice para bÃºsqueda por tenant

    __table_args__ = (

        Index("ix_professionals_tenant_email", "tenant_id", "email", unique=True),

    )

# =============================================================================

# CLIENT (El Paciente/Alumno)

# =============================================================================

class Client(Base):

    """

    Cliente final que recibe servicios del profesional.

    Soporta sincronizaciÃ³n offline-first desde la app mÃ³vil.

    """

    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("tenants.id", ondelete="CASCADE"),

        nullable=False

    )

    professional_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("professionals.id", ondelete="SET NULL"),

        nullable=True

    )

    # Datos personales

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)

    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    whatsapp_id: Mapped[Optional[str]] = mapped_column(

        String(50),

        nullable=True,

        comment="WhatsApp Business API identifier"

    )

    # Datos fÃ­sicos base

    birth_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    height_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Estado de sincronizaciÃ³n (Offline-First)

    sync_status: Mapped[str] = mapped_column(

        String(50),

        default=SyncStatus.SYNCED.value,

        nullable=False

    )

    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Datos adicionales flexibles

    extra_data: Mapped[dict] = mapped_column(

        JSONB,

        default=dict,

        comment="Notas, preferencias, alergias, etc."

    )

    # Activo

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Gemelo Digital (Edge Cases Epic 6)

    coaching_status: Mapped[str] = mapped_column(

        String(50), 

        default="active", 

        server_default="active",

        comment="active, interim_maintenance"

    )

    unassigned_days: Mapped[int] = mapped_column(

        Integer, 

        default=0, 

        server_default="0",

        comment="DÃ­as sin coach para Revenue Guard Prorrateo"

    )

    # Hybrid Revenue Engine (Client Status)

    payment_status: Mapped[str] = mapped_column(

        String(50),

        default=PaymentStatus.TRIAL.value,

        nullable=False

    )

    access_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    next_billing_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    is_ai_only: Mapped[bool] = mapped_column(Boolean, default=False)

    # Auth Security (Phase 25)

    session_version: Mapped[int] = mapped_column(Integer, default=1, server_default="1", nullable=False, comment="Incrementado en logout-all para invalidar JWTs antiguos")

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime, 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow

    )

    # Relaciones

    tenant = relationship("Tenant", back_populates="clients")

    professional = relationship("Professional", back_populates="clients")

    protocols = relationship("Protocol", back_populates="client")

    active_workout_plans = relationship("ActiveWorkoutPlan", back_populates="client")

    chart_records = relationship("ChartRecord", back_populates="client")

    __table_args__ = (

        Index("ix_clients_tenant_phone", "tenant_id", "phone"),

        Index("ix_clients_whatsapp", "whatsapp_id"),

        Index("ix_clients_dashboard_metrics", "tenant_id", "is_active", "payment_status"),

        Index("ix_clients_dashboard_time", "tenant_id", "created_at"),

        Index("idx_clients_extra_data_ghost", "extra_data", postgresql_using="gin"),

    )

# =============================================================================

# CLINICAL ENGINE (Injury Matrix - Phase 18)

# =============================================================================

class InjuryMatrix(Base):

    """

    Matriz de Lesiones y Contraindicaciones para el Clinical Engine.

    Mapea etiquetas de lesiones a restricciones biomecÃ¡nicas y reglas de mutaciÃ³n.

    """

    __tablename__ = "injury_matrix"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    # Etiqueta Ãºnica para el motor de reglas (ej: LOWER_BACK_PAIN)

    injury_tag: Mapped[str] = mapped_column(

        String(100), 

        unique=True, 

        nullable=False,

        index=True

    )

    # Metadatos clÃ­nicos

    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True) # Zona_Dolor

    pathology: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Patologia_Comun_Asociada

    # Restricciones BiomecÃ¡nicas (JSONB Arrays)

    contraindicated_patterns: Mapped[list] = mapped_column(JSONB, default=list) # Patrones_Movimiento_Bloqueados

    recommended_patterns: Mapped[list] = mapped_column(JSONB, default=list) # Alternativas_Seguras_Recomendadas

    red_flag_exercises: Mapped[list] = mapped_column(JSONB, default=list) # Ejercicios_Bandera_Roja

    # Reglas DinÃ¡micas

    mutation_rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Regla_de_Mutacion_Algoritmica

    # Notas adicionales

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime, 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow

    )

# =============================================================================

# PROTOCOL (Dietas/Rutinas - JSONB Flexible)

# =============================================================================

class Protocol(Base):

    """

    Protocolo asignado a un cliente (dieta, rutina, suplementaciÃ³n).

    Modelo HÃ­brido (Relacional + Documental JSONB) para Hito C.

    """

    __tablename__ = "protocols"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("tenants.id", ondelete="CASCADE"),

        nullable=True

    )

    professional_id: Mapped[Optional[uuid.UUID]] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("professionals.id", ondelete="CASCADE"),

        nullable=True

    )

    client_id: Mapped[Optional[uuid.UUID]] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("clients.id", ondelete="CASCADE"),

        nullable=True

    )

    type: Mapped[str] = mapped_column(

        String(50),

        nullable=False

    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # La Columna Documental

    content: Mapped[dict] = mapped_column(

        JSONB,

        nullable=False,

        comment="Estructura flexible: meals, exercises, supplements, etc."

    )

    # Vector embedding para bÃºsqueda semÃ¡ntica (pgvector)

    vector_embedding = Column(

        Vector(1536),

        nullable=True,

        comment="Embedding para bÃºsqueda semÃ¡ntica de protocolos"

    )

    # Versioning & Clinical Immutability

    version: Mapped[int] = mapped_column(Integer, default=1)

    status: Mapped[str] = mapped_column(String(50), default=ProtocolStatus.DRAFT.value)

    # Universal Baselines (Fase 66)

    is_global: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    origin_global_id: Mapped[Optional[uuid.UUID]] = mapped_column(

        UUID(as_uuid=True), 

        nullable=True,

        comment="ID del Protocolo Maestro del que fue clonado (Copy-on-Write)"

    )

    # Fechas de vigencia

    starts_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime, 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow

    )

    # Relaciones

    client = relationship("Client", back_populates="protocols")

    tenant = relationship("Tenant")

    professional = relationship("Professional")

    __table_args__ = (

        Index("ix_protocols_client_type", "client_id", "type"),

        Index("ix_protocols_status", "status"),

        Index("ix_protocols_tenant_client", "tenant_id", "client_id"),

    )

# =============================================================================

# MESOCYCLE (Plan Builder - JSONB Flexible + RLS Zero-Trust)

# =============================================================================

class Mesocycle(Base):

    """

    Estructura transaccional del Cascade Builder.

    Almacena rutinas completas en un JSONB para escritura O(1).

    """

    __tablename__ = "mesocycles"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("tenants.id", ondelete="CASCADE"),

        nullable=False

    )

    client_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("clients.id", ondelete="CASCADE"),

        nullable=False

    )

    coach_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("professionals.id", ondelete="SET NULL"),

        nullable=False

    )

    taxonomy_id: Mapped[str] = mapped_column(String(50), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # La Columna Documental Core (OLTP)

    routine_structure: Mapped[dict] = mapped_column(

        JSONB,

        nullable=False,

        comment="Estructura serializada de la rutina (Data Stripped)"

    )

    nutrition_plan: Mapped[Optional[dict]] = mapped_column(

        JSONB,

        nullable=True

    )

    telemetry_snapshot: Mapped[Optional[dict]] = mapped_column(

        JSONB,

        nullable=True

    )

    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    version: Mapped[int] = mapped_column(Integer, default=1, server_default='1')

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default='true')

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, server_default=func.now())

    updated_at: Mapped[datetime] = mapped_column(

        DateTime(timezone=True), 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow,

        server_default=func.now()

    )

    __table_args__ = (

        Index("idx_mesocycles_tenant_client_models", "tenant_id", "client_id"),

        Index("idx_mesocycles_coach_active_models", "coach_id", "is_active"),

    )

# =============================================================================

# ACTIVE WORKOUT PLAN (Protocol Rebase Pattern / Snapshot)

# =============================================================================

class ActiveWorkoutPlan(Base):

    """

    Plan activo instanciado a partir de un Protocolo base.

    Almacena una copia (snapshot) y detecta derivas en la plantilla original.

    """

    __tablename__ = "active_workout_plans"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("tenants.id", ondelete="CASCADE"),

        nullable=False

    )

    client_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("clients.id", ondelete="CASCADE"),

        nullable=False

    )

    origin_protocol_id: Mapped[Optional[uuid.UUID]] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("protocols.id", ondelete="SET NULL"),

        nullable=True,

        comment="Arquetipo original del cual se derivÃ³ este plan activo"

    )

    state_hash: Mapped[str] = mapped_column(

        String(64),

        nullable=False,

        comment="SHA-256 hash de la estructura para detectar mutaciones en caliente"

    )

    content: Mapped[dict] = mapped_column(

        JSONB,

        nullable=False,

        comment="Snapshot inmutable con e1RM aplicado"

    )

    status: Mapped[str] = mapped_column(

        String(50),

        default=ActivePlanStatus.ACTIVE.value

    )

    conflict_detected_at: Mapped[Optional[datetime]] = mapped_column(

        DateTime,

        nullable=True,

        comment="Timestamp de cuando se detectÃ³ la deriva con el origin_protocol"

    )

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime,

        default=datetime.utcnow,

        onupdate=datetime.utcnow

    )

    # Relaciones

    client = relationship("Client", back_populates="active_workout_plans")

    tenant = relationship("Tenant")

    origin_protocol = relationship("Protocol")

    __table_args__ = (

        Index("ix_awp_client_status", "client_id", "status"),

        Index("ix_awp_origin_protocol", "origin_protocol_id", "state_hash"),

    )

# =============================================================================

# CHART RECORD (Voice-to-Chart Output - Module A)

# =============================================================================

class ChartRecord(Base):

    """

    Registro de consulta generado por Voice-to-Chart.

    Formato SOAP estructurado desde transcripciÃ³n de voz.

    """

    __tablename__ = "chart_records"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    client_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("clients.id", ondelete="CASCADE"),

        nullable=False

    )

    professional_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey("professionals.id", ondelete="SET NULL"),

        nullable=True

    )

    # Fecha de la consulta

    consultation_date: Mapped[datetime] = mapped_column(

        DateTime,

        default=datetime.utcnow,

        nullable=False

    )

    # SOAP completo en JSONB (validado previamente por Pydantic)

    soap_data: Mapped[dict] = mapped_column(

        JSONB,

        nullable=False,

        comment="Subjective, Objective, Assessment, Plan"

    )

    # Metadatos de procesamiento AI

    transcription_confidence: Mapped[float] = mapped_column(Float, default=0.0)

    extraction_confidence: Mapped[float] = mapped_column(Float, default=0.0)

    # TranscripciÃ³n original (audit trail)

    raw_transcription: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Requiere revisiÃ³n manual

    requires_review: Mapped[bool] = mapped_column(Boolean, default=False)

    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(

        UUID(as_uuid=True),

        nullable=True

    )

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime, 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow

    )

    # Relaciones

    client = relationship("Client", back_populates="chart_records")

    professional = relationship("Professional", back_populates="chart_records")

    __table_args__ = (

        Index("ix_chart_records_client_date", "client_id", "consultation_date"),

        Index("ix_chart_records_review", "requires_review"),

    )

# =============================================================================

# PAYMENTS (Revenue Guard B2C)

# =============================================================================

class Payment(Base):

    """Registro de pagos B2C de clientes al profesional o tenant."""

    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4,

        index=True

    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False

    )

    client_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False

    )

    # Financial fields (Stored in Cents to avoid floating point errors)

    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)

    currency: Mapped[str] = mapped_column(String(3), default="USD")

    status: Mapped[str] = mapped_column(String(50), default="active") # active, past_due, failed

    provider_id: Mapped[Optional[str]] = mapped_column(String(255)) # Stripe Charge ID / MP Pago ID

    created_at: Mapped[datetime] = mapped_column(

        DateTime(timezone=True), 

        default=datetime.utcnow,

        nullable=False

    )

    # Relaciones

    tenant = relationship("Tenant")

    client = relationship("Client")

    __table_args__ = (

        Index("ix_payments_tenant_client", "tenant_id", "client_id"),

        Index("ix_payments_status", "status"),

    )

# =============================================================================

# WORKOUT LOGS (Real Data for Dashboard)

# =============================================================================

class SquadNotification(Base):

    """

    Feed de notificaciones para interacciones sociales dentro de la micro-comunidad.

    ActÃºa como Cold Storage para el Activity Feed con Cursor Pagination.

    """

    __tablename__ = "squad_notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    squad_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("squads.id", ondelete="CASCADE"), nullable=False)

    sender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    sender_name: Mapped[str] = mapped_column(String(100), nullable=False)

    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)

    message: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (

        Index("ix_squad_notif_squad_created", "squad_id", "created_at", postgresql_ops={"created_at": "DESC"}),

    )

class AthleteCRISnapshot(Base):

    """

    Snapshots incrementales del Churn Risk Index (CRI) para retenciÃ³n analÃ­tica.

    Escrito en background por el Worker de Celery (CQRS Write Path).

    """

    __tablename__ = "athlete_cri_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)

    cri_score: Mapped[float] = mapped_column(Float, nullable=False)

    risk_level: Mapped[str] = mapped_column(String(20), nullable=False) # GREEN, YELLOW, RED

    factors_jsonb: Mapped[dict] = mapped_column(JSONB, nullable=False, comment="InactivityFactor, FatigueFactor, DisconnectionFactor")

    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    # Relaciones

    client = relationship("Client")

    tenant = relationship("Tenant")

class WorkoutSession(Base):

    """SesiÃ³n de entrenamiento realizada."""

    __tablename__ = "workout_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)

    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # MÃ©tricas calculadas

    total_volume_kg: Mapped[float] = mapped_column(Float, default=0.0)

    total_reps: Mapped[int] = mapped_column(Integer, default=0)

    perceived_rpe: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-10

    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    external_load_watts: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    external_load_gps_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    internal_load: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Resiliencia Math Engine (Phase 26)

    math_status: Mapped[str] = mapped_column(String(50), default="PENDING", server_default="PENDING", nullable=False)

    # Relaciones

    client = relationship("Client")

    logs = relationship("ExerciseLog", back_populates="session")

class ExerciseLog(Base):

    """Detalle de ejercicio realizado (Series/Reps)."""

    __tablename__ = "exercise_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workout_sessions.id"), nullable=False)

    exercise_name: Mapped[str] = mapped_column(String, nullable=False)

    exercise_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    sets: Mapped[int] = mapped_column(Integer, default=0)

    reps: Mapped[int] = mapped_column(Integer, default=0)

    weight_kg: Mapped[float] = mapped_column(Float, default=0.0)

    # AnÃ¡lisis de carga (Injury Risk)

    load_increase_pct: Mapped[float] = mapped_column(Float, default=0.0)  # vs semana anterior

    session = relationship("WorkoutSession", back_populates="logs")

# =============================================================================

# EXERCISE VAULT (CatÃ¡logo Base)

# =============================================================================

# (El modelo 'Exercise' con taxonomÃ­a biomecÃ¡nica completa estÃ¡ definido mÃ¡s abajo)

class Macrocycle(Base):

    """

    PeriodizaciÃ³n a largo plazo (Drafts e implementados).

    Validado por el Coach (HITL) antes de distribuirse a WorkoutPlans.

    """

    __tablename__ = "macrocycles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    coach_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professionals.id", ondelete="SET NULL"), nullable=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    target_tags: Mapped[list] = mapped_column(JSONB, default=list, server_default='[]', comment="Tags originales de hipertrofia/fuerza target")

    # 1 to 52 semanas de estructura profunda en formato JSON

    structure: Mapped[dict] = mapped_column(JSONB, nullable=False, comment="Estructura jerÃ¡rquica Semanas -> DÃ­as -> Bloques -> Ejercicios")

    status: Mapped[str] = mapped_column(String(50), default="PENDING_APPROVAL", comment="PENDING_APPROVAL, ACTIVE, ARCHIVED")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # IndizaciÃ³n para bÃºsqueda rÃ¡pida de Drafts pendientes

    __table_args__ = (

        Index("ix_macrocycles_tenant_status", "tenant_id", "status"),

    )

# =============================================================================

# FEATURES (Video Review, Finance)

# =============================================================================

class VideoReview(Base):

    """Cola de revisiÃ³n de tÃ©cnica."""

    __tablename__ = "video_reviews"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)

    professional_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)

    exercise_name: Mapped[str] = mapped_column(String, nullable=False)

    video_url: Mapped[str] = mapped_column(String, nullable=False)

    thumbnail_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    status: Mapped[str] = mapped_column(String, default="pending", server_default="pending")

    feedback: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    ai_priority: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, comment="P1, P2, P3")

    ai_triage_category: Mapped[Optional[str]] = mapped_column(String, nullable=True)

# =============================================================================

# FINANCIAL LEDGER & MONETIZATION (Phase 52)

# =============================================================================

from sqlalchemy import UniqueConstraint

class FinancialLedger(Base):

    """

    Ledger Inmutable para transacciones financieras B2B2C.

    Append-Only. No se permiten UPDATEs a los montos.

    """

    __tablename__ = "financial_ledger"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id = Column(String, index=True, nullable=False)

    amount_cents = Column(BigInteger, nullable=False) # Positivo (ingreso), Negativo (egreso)

    transaction_type = Column(String, nullable=False) # ej. 'SUBSCRIPTION_PAYMENT', 'REFUND'

    reference_id = Column(String, nullable=False, unique=True) # ID de la preferencia de pago o ID de transacciÃ³n de Stripe/MP

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Ãndice compuesto para consultas rÃ¡pidas por tenant

    __table_args__ = (

        Index('idx_tenant_created', 'tenant_id', 'created_at'),

    )

class PurchaseIntent(Base):

    """

    IntenciÃ³n de compra para Idempotencia de Checkout.

    Asegura que un doble click en Frontend no procese dos pagos simultÃ¡neos.

    """

    __tablename__ = "purchase_intents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id = Column(String, nullable=False)

    idempotency_key = Column(String, nullable=False)

    amount_cents = Column(BigInteger, nullable=False)

    status = Column(String, default="PENDING")

    __table_args__ = (

        # El escudo de base de datos contra el doble click de React

        UniqueConstraint('tenant_id', 'idempotency_key', name='uq_tenant_idempotency'),

    )

    # AI Triage Fields

    ai_priority: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, comment="P1, P2, P3")

    ai_triage_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    ai_analysis_details: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

# =============================================================================

# ONBOARDING & AI MATCHMAKING (Phase 25)

# =============================================================================

class AthleteDraft(Base):

    """

    Borrador de Rutina Generado por el Swap Engine (Matchmaking IA).

    Contiene la rutina mutada, el Risk Score, y el razonamiento de la IA.

    Espera la aprobaciÃ³n del Coach (Split-Screen UI).

    """

    __tablename__ = "athlete_drafts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    # Datos crudos del Onboarding B2C (Legacy/Flexibilidad)

    onboarding_data: Mapped[dict] = mapped_column(JSONB, nullable=False, comment="EstrÃ©s, Equipo, Lesiones, Video URL")

    # Datos Estructurados (TaxonomÃ­a Universal - Phase 25)

    training_experience: Mapped[str] = mapped_column(String(50), default="BEGINNER")

    training_days_available: Mapped[int] = mapped_column(Integer, default=3)

    training_duration_pref: Mapped[int] = mapped_column(Integer, default=60)

    medical_tags: Mapped[list] = mapped_column(JSONB, default=list, server_default='[]')

    goal_tags: Mapped[list] = mapped_column(JSONB, default=list, server_default='[]')

    habit_sleep_quality: Mapped[int] = mapped_column(Integer, default=3)

    habit_stress_level: Mapped[int] = mapped_column(Integer, default=3)

    habit_work_type: Mapped[str] = mapped_column(String(50), default="SEDENTARY")

    # Resultados del Swap Engine

    original_plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="SET NULL"), nullable=True)

    mutated_routine: Mapped[dict] = mapped_column(JSONB, nullable=False, comment="La rutina con ejercicios cambiados y MRV ajustado")

    ai_reasoning: Mapped[dict] = mapped_column(JSONB, nullable=False, comment="Array de justificaciones estructuradas por bloque o ejercicio")

    risk_score: Mapped[str] = mapped_column(String(20), default="Green", comment="Green, Yellow, Red")

    status: Mapped[str] = mapped_column(String(50), default="pending_review", comment="pending_review, approved, discarded")

    # Chapter 4: Habit Stacking Anchor (PsicologÃ­a del Comportamiento)

    habit_anchor: Mapped[Optional[str]] = mapped_column(

        String(255), nullable=True,

        comment="HÃ¡bito preexistente al que se ancla el entrenamiento (ej: 'DespuÃ©s de tomar mi cafÃ© matutino')"

    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # IndizaciÃ³n para el Inbox del Coach

    __table_args__ = (

        Index("ix_athlete_drafts_tenant_status", "tenant_id", "status"),

    )

class FinancialTransaction(Base):

    """Ledger de pagos (Split & Direct)."""

    __tablename__ = "financial_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)

    client_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True)

    amount_total: Mapped[float] = mapped_column(Float, nullable=False)

    amount_platform: Mapped[float] = mapped_column(Float, default=0.0)  # Nuestro fee

    amount_pro: Mapped[float] = mapped_column(Float, default=0.0)       # Pago al entrenador

    currency: Mapped[str] = mapped_column(String(3), default="USD")

    provider: Mapped[str] = mapped_column(String, default="mercadopago") # stripe, cash

    external_id: Mapped[str] = mapped_column(String, nullable=True)

    status: Mapped[str] = mapped_column(String, default="completed")

    # Telemetry B2C Checkout

    checkout_status: Mapped[str] = mapped_column(String(20), default="created")

    checkout_created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    checkout_confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (

        Index("ix_fin_tx_dashboard", "tenant_id", "created_at"),

    )

# =============================================================================

# SOVEREIGN QUARANTINE (Dead Letter Queue - Epic A)

# =============================================================================

class ImportQuarantineLog(Base):

    """

    Sovereign Quarantine (Dead Letter Queue) para Magic Import B2B.

    Almacena registros anÃ³malos o corruptos para su posterior resoluciÃ³n manual,

    evitando que un error en una fila detenga el procesamiento del lote completo.

    """

    __tablename__ = "import_quarantine_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    # JSON inmutable original para que el administrador pueda corregirlo

    raw_payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # RazÃ³n de la anomalÃ­a (ej. ValidationError, EmailDuplicate)

    error_reason: Mapped[str] = mapped_column(Text, nullable=False)

    # pending, resolved, dismissed

    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)

    # Auditar tiempos

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    tenant = relationship("Tenant")

    __table_args__ = (

        Index("ix_import_quarantine_tenant_status", "tenant_id", "status"),

    )

# =============================================================================

# FINOPS IDEMPOTENCY ENGINE

# =============================================================================

class ProcessedPaymentEvent(Base):

    """

    Control de idempotencia para webhooks de pago.

    Evita procesar el mismo evento (webhook) mÃºltiples veces.

    """

    __tablename__ = "processed_payment_events"

    # event_id es el ID Ãºnico provisto por el payment provider (ID de pago o ID de evento de webhook)

    event_id: Mapped[str] = mapped_column(String(255), primary_key=True)

    provider: Mapped[PaymentProvider] = mapped_column(Enum(PaymentProvider), nullable=False)

    processed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True)

    # Para auditorÃ­a rÃ¡pida

    amount_cents: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    payload_snapshot: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    __table_args__ = (

        Index("ix_payment_events_provider_at", "provider", "processed_at"),

    )

# =============================================================================

# PATIENT (GestiÃ³n de Pacientes)

# =============================================================================

class Patient(Base):

    """

    Paciente/Cliente gestionado por un profesional (User).

    Modelo simplificado para CRM clÃ­nico.

    """

    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    professional_id: Mapped[uuid.UUID] = mapped_column(

        ForeignKey("users.id", ondelete="CASCADE"),

        nullable=False

    )

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    age: Mapped[int] = mapped_column(Integer, nullable=False)

    weight: Mapped[float] = mapped_column(Float, nullable=False)

    goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Data Gravity: Nutritional Profile / Archetypes / GLP-1 / Clinical Data

    extra_data: Mapped[dict] = mapped_column(

        JSONB,

        default=dict,

        server_default='{}',

        nullable=False,

        comment="Nutritional Profile & Clinical Archetypes via Pydantic"

    )

    # Command Center: Asynchronous Snapshot Data

    semaphore_status: Mapped[Optional[str]] = mapped_column(String(20), default="GREEN", nullable=True)

    primary_risk_factor: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    context_metadata: Mapped[dict] = mapped_column(JSONB, default=dict, server_default='{}', nullable=False)

    last_risk_evaluation: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    snooze_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime, 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow

    )

    # Relaciones

    professional = relationship("User", back_populates="patients")

    clinical_documents = relationship("ClinicalDocument", back_populates="patient", cascade="all, delete-orphan")

# =============================================================================

# CLINICAL VAULT (Ingesta OCR & IA)

# =============================================================================

class ClinicalDocument(Base):

    """

    BÃ³veda de Ingesta y Cuarentena para datos mÃ©dicos (PDFs, ImÃ¡genes) procesados por OCR/IA.

    """

    __tablename__ = "clinical_documents"

    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    patient_id: Mapped[uuid.UUID] = mapped_column(

        ForeignKey("patients.id", ondelete="CASCADE"),

        nullable=False

    )

    file_url: Mapped[str] = mapped_column(String(1024), nullable=False)

    status: Mapped[str] = mapped_column(

        String(50), 

        nullable=False, 

        default="processing" # processing, pending_review, verified, failed

    )

    # Data Cruda / ExtraÃ­da

    extracted_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # AuditorÃ­a (Human-in-the-Loop)

    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(

        ForeignKey("users.id", ondelete="SET NULL"),

        nullable=True

    )

    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    file_metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Timestamps

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime, 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow

    )

    # Relaciones

    patient = relationship("Patient", back_populates="clinical_documents")

    reviewer = relationship("User")

# =============================================================================

# WORKOUT BUILDER (Fitness Intelligence)

# =============================================================================

class AuditableMixin:

    """Mixin base para auditorÃ­a y soft deletes."""

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(

        DateTime, 

        default=datetime.utcnow, 

        onupdate=datetime.utcnow, 

        nullable=False

    )

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

class WorkoutPlan(Base, AuditableMixin):

    """

    Plan de entrenamiento en el WorkoutBuilder.

    Aislamiento Multi-Tenant: tenant_id debe coincidir en toda la jerarquÃ­a.

    Soporta 'Master Templates' si client_id es nulo e is_master es True.

    """

    __tablename__ = "workout_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    professional_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False)

    # Hecho opcional para permitir plantillas base no asignadas

    client_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    delivery_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Master Templates (Cascade Builder B2B)

    is_master: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    derived_from_master_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="SET NULL"), nullable=True)

    # Relaciones

    days = relationship(

        "WorkoutDay", 

        back_populates="plan", 

        cascade="all, delete-orphan"

    )

    __table_args__ = (

        Index("ix_workout_plans_tenant_professional", "tenant_id", "professional_id"),

        Index("ix_workout_plans_tenant_client", "tenant_id", "client_id"),

    )

class WorkoutDay(Base, AuditableMixin):

    """

    DÃ­a dentro de un plan de entrenamiento (ej: DÃ­a 1 - Empuje).

    """

    __tablename__ = "workout_days"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    order: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relaciones

    plan = relationship("WorkoutPlan", back_populates="days")

    supersets = relationship(

        "SupersetGroup", 

        back_populates="day", 

        cascade="all, delete-orphan"

    )

class SupersetGroup(Base, AuditableMixin):

    """

    Grupo de superserie (puede contener 1 o mÃ¡s ejercicios).

    """

    __tablename__ = "superset_groups"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    day_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workout_days.id", ondelete="CASCADE"), nullable=False)

    order: Mapped[int] = mapped_column(Integer, nullable=False)

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones

    day = relationship("WorkoutDay", back_populates="supersets")

    exercises = relationship(

        "ExerciseTarget", 

        back_populates="superset_group", 

        cascade="all, delete-orphan"

    )

# =============================================================================

# EXERCISE DATABASE (Biomechanical Taxonomy)

# =============================================================================

class Exercise(Base, AuditableMixin):

    """

    CatÃ¡logo maestro de ejercicios con taxonomÃ­a biomecÃ¡nica de 11 dimensiones.

    Utilizado por el Swap Engine para sustituciones inteligentes.

    """

    __tablename__ = "exercises"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    exercise_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)

    # Propiedad Intelectual (Phase 19)

    is_global: Mapped[bool] = mapped_column(Boolean, default=True, server_default='true', nullable=False)

    trainer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=True)

    video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Dimensiones Core

    official_name: Mapped[str] = mapped_column(String(255), nullable=False)

    search_aliases: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # CSV o JSON

    movement_pattern: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. 'Dominante de Rodilla'

    laterality: Mapped[str] = mapped_column(String(50), nullable=False) # 'Bilateral', 'Unilateral'

    axial_load: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # BiomecÃ¡nica

    primary_muscle: Mapped[str] = mapped_column(String(100), nullable=False)

    synergist_muscles: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)

    # Restricciones de Entrenamiento

    equipment_required: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)

    skill_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False) # 1-5

    joint_impact: Mapped[str] = mapped_column(String(50), nullable=False) # 'Bajo', 'Medio', 'Alto'

    # GraphRAG Biomechanical Filtering Fields

    mechanic: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, comment="compound or isolation")

    contraindications: Mapped[list] = mapped_column(JSONB, default=list, server_default='[]', nullable=False, comment="List of medical tags that prevent this exercise e.g. ['inj_lower_back']")

    # AuditorÃ­a (vÃ­a mixin)

    __table_args__ = (

        Index("ix_exercises_patron", "movement_pattern"),

        Index("ix_exercises_agonista", "primary_muscle"),

    )

class ExerciseTarget(Base, AuditableMixin):

    """

    Objetivo de repeticiones y peso para un ejercicio en la rutina.

    """

    __tablename__ = "exercise_targets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    superset_group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("superset_groups.id", ondelete="CASCADE"), nullable=False)

    # Desnormalizado para permitir ejercicios custom del Pro que no estÃ©n en la DB central

    exercise_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="SET NULL"), nullable=True)

    custom_exercise_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    order: Mapped[int] = mapped_column(Integer, nullable=False)

    sets: Mapped[int] = mapped_column(Integer, nullable=False)

    reps: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    rpe: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Rate of Perceived Exertion (1-10)

    weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    rest_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones

    superset_group = relationship("SupersetGroup", back_populates="exercises")

    exercise = relationship("Exercise")

# =============================================================================

# CHAT / INBOX (The Sovereign Agora)

# =============================================================================

class Conversation(Base):

    """Hilo de conversaciÃ³n contextual (vinculado a una rutina, dieta, o general)."""

    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    professional_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False)

    # Contexto Forzado (Entity ID y Entity Type)

    entity_type: Mapped[Optional[str]] = mapped_column(String(50)) # e.g. 'WORKOUT', 'NUTRITION'

    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones

    tenant = relationship("Tenant")

    client = relationship("Client")

    professional = relationship("Professional")

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):

    """Mensaje individual dentro de una conversaciÃ³n, etiquetado por IntenciÃ³n."""

    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conversation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)

    sender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    sender_type: Mapped[str] = mapped_column(String(50), nullable=False) # 'CLIENT', 'PROFESSIONAL', 'SYSTEM'

    content: Mapped[str] = mapped_column(Text, nullable=False)

    # ClasificaciÃ³n de la IA Embebida

    intent_category: Mapped[str] = mapped_column(

        String(50), 

        default=IntentCategory.GENERAL.value,

        nullable=False

    )

    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones

    conversation = relationship("Conversation", back_populates="messages")

    __table_args__ = (

        Index("ix_messages_conversation_id", "conversation_id"),

        Index("ix_messages_is_read", "is_read"),

    )

# =============================================================================

# BURNABLE LINKS (B2C Authentication)

# =============================================================================

class BurnableLink(Base):

    """Token efÃ­mero de un solo uso para acceso B2C desde WhatsApp/Email."""

    __tablename__ = "burnable_links"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    is_used: Mapped[bool] = mapped_column(Boolean, default=False)

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones

    client = relationship("Client")

    tenant = relationship("Tenant")

# =============================================================================

# MASTER LIBRARY (Infrastructure & Equipment)

# =============================================================================

class GymEquipment(Base):

    """

    Inventario fÃ­sico de un gimnasio. Vital para el Swap Engine (PrescripciÃ³n BiomecÃ¡nica Realizable).

    """

    __tablename__ = "gym_equipment"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    total_quantity: Mapped[int] = mapped_column(Integer, default=1)

    status: Mapped[str] = mapped_column(String(50), default="active") # active, maintenance

    zone: Mapped[str] = mapped_column(String(50), default="free_weight") # free_weight, cardio, machines, functional

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones

    tenant = relationship("Tenant")

# =============================================================================

# MATH ENGINE & ACTIVE CANVAS (Workflow 3.2)

# =============================================================================

class WorkoutSets(Base):

    """

    Registro inmutable de una serie de entrenamiento ejecutada por el atleta.

    Optimizada para inserciones (IoT-like) y consultas de series temporales (e1RM).

    """

    __tablename__ = "workout_sets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    athlete_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    exercise_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False) # Ref a ejercicio estÃ¡tico

    protocol_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("protocols.id", ondelete="CASCADE"), nullable=True)

    # Llave generada por el cliente (UUID) para prevenir doble gasto (Fase 14)

    idempotency_key: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)

    target_reps: Mapped[int] = mapped_column(Integer, nullable=False)

    target_weight: Mapped[float] = mapped_column(Float, nullable=False)

    actual_reps: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    actual_weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    rpe: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # Rate of Perceived Exertion (1-10)

    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    is_unscheduled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default='false')

    # CRITICAL GUARDRAIL: El timestamp debe provenir del cliente para garantizar 

    # consistencia cronolÃ³gica en anÃ¡lisis (Math Engine).

    client_created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    __table_args__ = (

        Index("ix_workout_sets_athlete_exercise_time", "athlete_id", "exercise_id", "client_created_at"),

    )

class AthleteExerciseStats(Base):
    """
    Tabla de estadísticas en constante actualización por el Math Engine.
    Mantiene el e1RM actual para autorregulación de cargas (O(1) lectura).
    """
    __tablename__ = "athlete_exercise_stats"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    current_e1rm: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    last_computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index("ix_athlete_stats_unique", "athlete_id", "exercise_id", unique=True),
    )

class PushSubscription(Base):
    """
    Suscripciones a notificaciones web push del navegador del atleta.
    """
    __tablename__ = "push_subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    
    endpoint: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    keys_p256dh: Mapped[str] = mapped_column(String(255), nullable=False)
    keys_auth: Mapped[str] = mapped_column(String(255), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

# =============================================================================
# NUTRITIONAL COPILOT (Workflow G)
# =============================================================================

class Recipe(Base):
    """
    Receta Híbrida (NaaS Builder)
    Almacena metadatos e ingredientes (SARA/Custom)
    """
    __tablename__ = "recipes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    professional_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    ingredients: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list) # List of MealItem schema
    macros: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict) # MacroNutrients schema
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class NutritionPlan(Base):
    """
    Plan Nutricional estructurado - CRUD Determinista (Sprint 1)
    """
    __tablename__ = "nutrition_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    professional_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # JSONB para almacenar los objetivos diarios de macronutrientes
    daily_macros_target: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # JSONB para almacenar la lista de MealBlock.
    meals: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_nutrition_plans_client", "client_id"),
    )

class NutritionLog(Base):

    """

    Registro de audio transcrito y analizado de Voice-to-Chart (B2C).

    """

    __tablename__ = "nutrition_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    transcription: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Lo que extrajo Whisper

    # Macros estimados por LiteLLM

    total_calories: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    protein_g: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    carbs_g: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    fat_g: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    analyzed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (

        Index("ix_nutrition_logs_client_time", "client_id", "analyzed_at"),

    )

# =============================================================================

# GAMIFICATION ENGINE & O2O ECONOMY (Workflow C/O2O Phase 23)

# =============================================================================

class AthleteWallet(Base):

    """

    Billetera digital del atleta. Saldo desnormalizado para consultas O(1).

    Las actualizaciones de `balance` deben hacerse re-calculando todos los WalletTransaction 

    o de forma atÃ³mica (con SELECT FOR UPDATE) para prevenir fraude.

    """

    __tablename__ = "athlete_wallets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Saldo en "Vital Points" (u otra moneda configurada por el tenant)

    balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (

        Index("ix_athlete_wallets_client", "client_id"),

    )

class WalletTransaction(Base):

    """

    Contabilidad de doble entrada inmutable para los Vital Points.

    Cada evento (ganar o gastar puntos) queda registrado para auditorÃ­a FinTech.

    """

    __tablename__ = "wallet_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    wallet_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("athlete_wallets.id", ondelete="CASCADE"), nullable=False)

    # Cantidad: Positiva (gana), Negativa (gasta)

    amount: Mapped[int] = mapped_column(Integer, nullable=False)

    # EARNED, SPENT, REFUNDED, EXPIRED

    transaction_type: Mapped[str] = mapped_column(String(50), nullable=False) 

    # De dÃ³nde vino el cambio. Ej: 'habit_completed_water', 'reward_claim_X'

    reference_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True) 

    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (

        Index("ix_wallet_txs_wallet_type", "wallet_id", "transaction_type"),

        Index("ix_wallet_txs_created_at", "created_at"),

    )

class Reward(Base, AuditableMixin):

    """

    CatÃ¡logo de Recompensas configurado por el DueÃ±o del Tenant (O2O).

    Ejemplo: Un "Batido Post-Entreno" que cuesta 500 Puntos.

    """

    __tablename__ = "rewards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Costo en Vital Points

    cost_points: Mapped[int] = mapped_column(Integer, nullable=False)

    # Inventario Opcional (Si el stock es finito en el Gym)

    stock: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    __table_args__ = (

        Index("ix_rewards_tenant_active", "tenant_id", "is_active"),

    )

# =============================================================================

# SNC TELEMETRY & PROACTIVE MUTATION (Workflow K Phase 24)

# =============================================================================

from sqlalchemy import UniqueConstraint, Date

class DailyReadiness(Base):

    """

    TelemetrÃ­a de Fatiga del Sistema Nervioso Central (SNC).

    Registra niveles de energÃ­a y dolor muscular por dÃ­a lÃ³gico.

    AlimentarÃ¡ al motor de mutaciÃ³n proactiva (Celery/LiteLLM).

    """

    __tablename__ = "daily_readiness"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    athlete_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    logical_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)

    # Escalas de 1 a 5 (1: Agotado, 5: MÃ¡xima EnergÃ­a)

    energy_level: Mapped[int] = mapped_column(Integer, nullable=False)

    muscle_soreness: Mapped[int] = mapped_column(Integer, nullable=False)

    stress_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    sleep_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (

        UniqueConstraint('athlete_id', 'logical_date', name='uq_athlete_logical_date'),

        Index("ix_daily_readiness_athlete_date", "athlete_id", "logical_date"),

    )

# =============================================================================

# CHAPTER 4: PSICOLOGÃA DEL COMPORTAMIENTO (MÃ³dulo "Mind")

# =============================================================================

class ConsistencyTier(str, PyEnum):

    """Niveles de consistencia no-punitiva (reemplazo de streaks lineales)."""

    BRONZE = "BRONZE"

    SILVER = "SILVER"

    GOLD = "GOLD"

class ConsistencyTracker(Base):

    """

    Motor de Consistencia No-Punitiva.

    Reemplaza los streaks lineales que se reinician a 0 al faltar 1 dÃ­a.

    Implementa la regla 'Nunca Falles Dos Veces': grace_days_remaining

    permite saltar hasta 2 dÃ­as sin perder el tier de consistencia.

    """

    __tablename__ = "consistency_trackers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False

    )

    # Score semanal (0-100) calculado por dÃ­as activos/dÃ­as planeados

    weekly_consistency_score: Mapped[int] = mapped_column(Integer, default=0)

    # Tier actual â NUNCA decrece si hay grace_days restantes

    current_tier: Mapped[str] = mapped_column(String(50), default=ConsistencyTier.BRONZE.value)

    # Ãltima fecha lÃ³gica de actividad registrada

    last_activity_logical_date: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)

    # Tolerancia a fallos (se resetea semanalmente a 2)

    grace_days_remaining: Mapped[int] = mapped_column(Integer, default=2)

    # Semanas consecutivas activas (para promociÃ³n de tier)

    consecutive_active_weeks: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (

        UniqueConstraint('client_id', name='uq_consistency_tracker_client'),

        Index("ix_consistency_tracker_client", "client_id"),

    )

class MicroMilestone(Base):

    """

    SMART-T Fragmenter: Checkpoints de Dopamina a Corto Plazo.

    Fragmenta metas anuales/mensuales en micro-victorias de ~12 dÃ­as

    para activar el circuito de recompensa con feedback inmediato.

    """

    __tablename__ = "micro_milestones"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False

    )

    # Ciclo de Dopamina: target date para este checkpoint (~12 dÃ­as)

    target_logical_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)

    # DescripciÃ³n del milestone (ej. "3 Sesiones de Fuerza completadas")

    milestone_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Estado de logro

    is_achieved: Mapped[bool] = mapped_column(Boolean, default=False)

    achieved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Recompensa XP vinculada al AthleteWallet

    xp_reward: Mapped[int] = mapped_column(Integer, default=50)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (

        Index("ix_micro_milestones_client_date", "client_id", "target_logical_date"),

    )

# =============================================================================

# EPIC 1 & EPIC 4: COMPASSION WALLET & SUNK COST ANCHOR

# =============================================================================

class AthleteCompassionWallet(Base):

    """

    Ãpica 1: RetenciÃ³n Compasiva

    Billetera de 'Escudos de CompasiÃ³n' y 'Tokens de RecuperaciÃ³n'.

    """

    __tablename__ = "athlete_compassion_wallets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True)

    available_streak_freezes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    recovery_tokens_balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    hibernation_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    fatigue_index: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (

        Index("ix_compassion_wallets_client", "client_id"),

    )

class AthleteLegacy(Base):

    """

    Ãpica 4 - Item 13: Sunk Cost Anchor

    VisualizaciÃ³n del progreso a perder en el flujo de offboarding (Zeigarnik Effect).

    """

    __tablename__ = "athlete_legacy"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True)

    current_legacy_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    total_consistency_gems: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    days_active_metabolism: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (

        Index("ix_athlete_legacy_client", "client_id"),

    )

class TrainingArchetype(Base):

    """

    Arquetipos de Entrenamiento predefinidos para la plataforma B2C.

    """

    __tablename__ = "training_archetypes"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    days_per_week_min: Mapped[int] = mapped_column(Integer, nullable=False)

    days_per_week_max: Mapped[int] = mapped_column(Integer, nullable=False)

    exp_level_min: Mapped[int] = mapped_column(Integer, nullable=False)

    exp_level_max: Mapped[int] = mapped_column(Integer, nullable=False)

    primary_goal: Mapped[str] = mapped_column(String(255), nullable=False)

    psychographic_profile: Mapped[str] = mapped_column(Text, nullable=False)

    coach_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class OnboardingTag(Base):

    """

    Tags de Onboarding para Matchmaker AI y Swap Engine.

    Mapeo de objetivos, experiencia, equipamiento y restricciones.

    """

    __tablename__ = "onboarding_tags"

    id_tag: Mapped[str] = mapped_column(String(100), primary_key=True)

    category: Mapped[str] = mapped_column(String(255), nullable=False)

    ui_text: Mapped[str] = mapped_column(String(255), nullable=False)

    backend_value: Mapped[str] = mapped_column(String(255), nullable=False)

    algorithm_impact: Mapped[str] = mapped_column(Text, nullable=True)

    target_user: Mapped[str] = mapped_column(String(100), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class MasterTemplate(Base):

    """

    Rutinas Maestras (BÃ³veda) creadas por profesionales para el Matchmaker.

    """

    __tablename__ = "master_templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    target_gender: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="ANY")

    experience_level: Mapped[str] = mapped_column(String(50), nullable=False)

    main_focus: Mapped[str] = mapped_column(String(100), nullable=False)

    days_per_week: Mapped[int] = mapped_column(Integer, nullable=False)

    routine_data: Mapped[dict] = mapped_column(JSONB, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

# =============================================================================

# CHAPTER 5: GAMIFICACIÃN Y RETENCIÃN INTERACTIVA (MÃ³dulo Gaming & Social)

# =============================================================================

class Squad(Base):

    """

    Squad de responsabilidad (mÃ¡ximo 5 personas) para cohesiÃ³n social y pertenencia.

    """

    __tablename__ = "squads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    goal_type: Mapped[str] = mapped_column(String(50), nullable=False) # SquadGoalType

    goal_target: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    starts_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Pilar 3: DesafÃ­o Grupal con lÃ­mite de tiempo

    challenge_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    challenge_ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

class SquadMember(Base):

    """

    AsociaciÃ³n de Clientes a un Squad. 

    Contiene la lÃ³gica de Escudo de Racha (Duolingo-style Streak Shield).

    """

    __tablename__ = "squad_members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    squad_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("squads.id", ondelete="CASCADE"), nullable=False)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    is_leader: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Pilar 1: Black Hat (AversiÃ³n a la pÃ©rdida) + ReparaciÃ³n de Racha

    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    total_activities: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    last_activity_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Escudos de racha adquiridos mediante XP/Vital Points

    streak_shields: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (

        UniqueConstraint('squad_id', 'client_id', name='uq_squad_client'),

    )

class SquadActivity(Base):

    """

    Registro histÃ³rico de actividades hechas por los miembros dentro del squad.

    """

    __tablename__ = "squad_activities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    squad_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("squads.id", ondelete="CASCADE"), nullable=False)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)

    description: Mapped[str] = mapped_column(String(500), nullable=False)

    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

# =============================================================================

# EPIC B - BIOMECHANICAL TELEMETRY & PREDICTIVE RADAR (Anti-Churn Engine)

# =============================================================================

class TelemetryAlert(Base):

    """

    Alertas de telemetrÃ­a y predicciÃ³n de riesgo (Anti-Churn & Fatigue).

    """

    __tablename__ = "telemetry_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    # "churn" o "fatigue_acwr"

    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # "danger", "warning", "info"

    severity: Mapped[str] = mapped_column(String(50), default="warning", nullable=False)

    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)

    metric_value: Mapped[float] = mapped_column(Float, nullable=False)

    message: Mapped[str] = mapped_column(Text, nullable=False)

    # "pending", "actioned", "dismissed"

    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    client = relationship("Client")

    tenant = relationship("Tenant")

# =============================================================================

# EPIC C - ONTOLOGY 360 & AUREA RAG ENGINE (Core-Shell Pattern)

# =============================================================================

class ExerciseTemplate(Base):

    """

    Tabla PeriÃ³dica BiomecÃ¡nica (PatrÃ³n HÃ­brido Core-Shell).

    Combina un escudo rÃ­gido de seguridad clÃ­nica (Core) con una membrana maleable de IA (Shell).

    """

    __tablename__ = "exercise_templates"

    # --- 1. CORE CLÃNICO (Escudo RÃ­gido e Inmutable) ---

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    primary_muscle_group: Mapped[str] = mapped_column(String(50), nullable=False)

    axial_load: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    is_glp1_safe: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    contraindications: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)

    # --- 2. SHELL COGNITIVO (Membrana Maleable para AUREA y RAG) ---

    aurea_metadata: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    embedding_vector = mapped_column(Vector(1536), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

import sqlalchemy as sa

class M2MAuditVault(Base):

    """BÃ³veda de auditorÃ­a particionada de grado bancario para telemetrÃ­a."""

    __tablename__ = 'm2m_audit_vault'

    __table_args__ = (

        {'postgresql_partition_by': 'RANGE (created_at)'}

    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Compound primary key for partitioning support

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True, server_default=sa.func.now())

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)

    event_type: Mapped[str] = mapped_column(String(50))

    payload: Mapped[dict] = mapped_column(JSONB)

    stack_trace: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class M2MAuditVaultGhost(Base):

    """ParticiÃ³n Separada para auditorÃ­a de Ghost Athletes (Onboarding)."""

    __tablename__ = 'm2m_audit_vault_ghost'

    __table_args__ = (

        {'postgresql_partition_by': 'RANGE (created_at)'}

    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True, server_default=sa.func.now())

    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)

    event_type: Mapped[str] = mapped_column(String(50))

    payload: Mapped[dict] = mapped_column(JSONB)

    stack_trace: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class FailedAuditJob(Base):

    """Dead Letter Queue en Postgres para eventos asÃ­ncronos fallidos (Outbox inverso)."""

    __tablename__ = 'failed_audit_jobs'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    original_payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    error_reason: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False) # PENDING / REPLAYED

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=sa.func.now(), nullable=False)

    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (

        sa.Index("ix_failed_audit_jobs_status", "status"),

    )

# =============================================================================
# SARA 2 NUTRITION DATABASE (Phase 3 - Quantified NaaS)
# =============================================================================

class SaraFoodItem(Base):
    """
    Catálogo de alimentos validados por SARA 2 (ENNyS 2, Argentina).
    Constituye la Biblioteca Global de Intercambios Inteligentes (Smart Swaps).
    """
    __tablename__ = "sara_food_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Identificadores y Nomenclatura
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # ej: "Vegetales Fibrosos", "Proteína de Élite"
    
    # Macros Base (por 100g de porción comestible)
    energy_kcal: Mapped[float] = mapped_column(Float, default=0.0)
    water_g: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Variables Maestras Críticas (Matemáticamente exactas)
    protein_g: Mapped[float] = mapped_column(Float, default=0.0, comment="<PROCNT>")
    available_carbs_g: Mapped[float] = mapped_column(Float, default=0.0, comment="<CHOAVLDF> (Carbohidratos Disponibles = Totales - Fibra)")
    total_fat_g: Mapped[float] = mapped_column(Float, default=0.0, comment="<FATCE>")
    
    # Variables Avanzadas (NaaS Level 2)
    dietary_fiber_g: Mapped[float] = mapped_column(Float, default=0.0, comment="<FIBTG> (Método AOAC)")
    saturated_fat_g: Mapped[float] = mapped_column(Float, default=0.0)
    monounsaturated_fat_g: Mapped[float] = mapped_column(Float, default=0.0)
    polyunsaturated_fat_g: Mapped[float] = mapped_column(Float, default=0.0)
    trans_fat_g: Mapped[float] = mapped_column(Float, default=0.0)
    cholesterol_mg: Mapped[float] = mapped_column(Float, default=0.0)
    sodium_mg: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Meta
    is_cooked: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

# =============================================================================
# HABITS & BEHAVIORAL ENGINE (P0-1 Multi-Role Persistence)
# =============================================================================

class Habit(Base):
    """
    Hábito prescrito o autogenerado para un atleta/cliente.
    Soporta hábitos de construcción (BUILD) y eliminación (BREAK),
    con control de días programados (1=Lunes..7=Domingo), niveles Lally y rachas.
    """
    __tablename__ = "habits"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)

    template_id: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(10), default="BUILD", nullable=False)  # 'BUILD' | 'BREAK'
    category: Mapped[str] = mapped_column(String(30), default="CUSTOM", nullable=False) # 'SUEÑO', 'FITNESS', 'NUTRICION', 'MINDSET', 'PRODUCTIVIDAD', 'CUSTOM'
    input_type: Mapped[str] = mapped_column(String(10), default="BOOLEAN", nullable=False) # 'BOOLEAN' | 'NUMERIC'
    unit: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    target_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    duration: Mapped[str] = mapped_column(String(30), default="INDEFINITE", nullable=False) # '1_WEEK', '1_MONTH', '3_MONTHS', 'INDEFINITE'
    scheduled_days: Mapped[list[int]] = mapped_column(ARRAY(Integer), default=[1, 2, 3, 4, 5, 6, 7], nullable=False)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=[], nullable=False)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    streak_current: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_best: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=0, nullable=False) # Nivel Lally (0..7)
    start_date: Mapped[datetime.date] = mapped_column(Date, default=datetime.utcnow().date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    logs: Mapped[list["HabitLog"]] = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_habits_client_active", "client_id", "is_active"),
    )


class HabitLog(Base):
    """
    Registro diario inmutable de cumplimiento de un hábito.
    Almacena el estado completado, valor numérico y zona de cumplimiento (NONE, LOW, HIGH).
    """
    __tablename__ = "habit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    habit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    log_date: Mapped[datetime.date] = mapped_column(Date, nullable=False, index=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    zone: Mapped[str] = mapped_column(String(10), default="NONE", nullable=False) # 'NONE', 'LOW', 'HIGH'

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relación inversa
    habit: Mapped["Habit"] = relationship("Habit", back_populates="logs")

    __table_args__ = (
        Index("uq_habit_logs_habit_date", "habit_id", "log_date", unique=True),
    )


# =============================================================================
# GAMIFICATION & CHALLENGES (P0-2 Multi-Role Persistence)
# =============================================================================

class AthleteChallenge(Base):
    """
    Reto individual o colectivo asignado a un atleta/cliente.
    Soporta tipos STREAK, VOLUME, CONSISTENCY con fechas de inicio y fin.
    """
    __tablename__ = "athlete_challenges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    squad_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("squads.id", ondelete="SET NULL"), nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="STREAK", nullable=False) # STREAK, VOLUME, CONSISTENCY
    target_value: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    current_value: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    state: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False) # ACTIVE, COMPLETED, FAILED, PIVOTED
    
    start_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    end_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)

    deployed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relación con eventos de progreso
    progress_events: Mapped[list["ChallengeProgressEvent"]] = relationship("ChallengeProgressEvent", back_populates="challenge", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_athlete_challenges_client_state", "client_id", "state"),
    )


class ChallengeProgressEvent(Base):
    """
    Evento granular de avance hacia la meta de un reto.
    """
    __tablename__ = "challenge_progress_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("athlete_challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)

    value: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="HABIT_CHECKIN", nullable=False) # HABIT_CHECKIN, WORKOUT_COMPLETE, MANUAL
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    challenge: Mapped["AthleteChallenge"] = relationship("AthleteChallenge", back_populates="progress_events")


# =============================================================================
# COACH FINANCES & COMMERCIAL PLANS (P0-3 Multi-Role Persistence)
# =============================================================================

class CommercialPlan(Base):
    """
    Catálogo de Planes Comerciales configurado por el Entrenador / Dueño del Tenant.
    """
    __tablename__ = "commercial_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="RECURRING", nullable=False) # 'RECURRING', 'PACK', 'ONE_OFF', 'ADVISORY'
    tier: Mapped[str] = mapped_column(String(50), default="PRO", nullable=False) # 'BASIC', 'PREMIUM', 'PRO', 'CUSTOM'
    price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="ARS", nullable=False)
    frequency: Mapped[str] = mapped_column(String(50), default="MONTHLY", nullable=False) # 'MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL', 'ONE_TIME', 'PER_SESSION'
    duration_text: Mapped[str] = mapped_column(String(100), default="Mensual recurrente", nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    badge: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    features: Mapped[list[str]] = mapped_column(ARRAY(String), default=[], nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_commercial_plans_tenant_active", "tenant_id", "is_active"),
    )


class ClientMembership(Base):
    """
    Membresía y estado de cobro/deuda asignado a un alumno específico.
    """
    __tablename__ = "client_memberships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("commercial_plans.id", ondelete="SET NULL"), nullable=True)

    plan_name: Mapped[str] = mapped_column(String(255), nullable=False)
    tier: Mapped[str] = mapped_column(String(50), default="PRO", nullable=False)
    monthly_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="PAID", nullable=False) # 'PAID', 'PENDING', 'OVERDUE', 'FAILED'
    last_payment_date: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    days_overdue: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    enrolled_date: Mapped[datetime.date] = mapped_column(Date, default=datetime.utcnow().date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relación con pagos
    payments: Mapped[list["ClientPaymentRecord"]] = relationship("ClientPaymentRecord", back_populates="membership", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_client_memberships_tenant_status", "tenant_id", "status"),
    )


class ClientPaymentRecord(Base):
    """
    Historial inmutable de cobros registrados (efectivo, transferencia, MercadoPago).
    """
    __tablename__ = "client_payment_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    membership_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("client_memberships.id", ondelete="SET NULL"), nullable=True)

    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="ARS", nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="TRANSFER", nullable=False) # 'TRANSFER', 'CASH', 'MERCADOPAGO', 'STRIPE'
    payment_date: Mapped[datetime.date] = mapped_column(Date, default=datetime.utcnow().date, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    membership: Mapped[Optional["ClientMembership"]] = relationship("ClientMembership", back_populates="payments")

    __table_args__ = (
        Index("ix_client_payment_records_tenant_date", "tenant_id", "payment_date"),
    )






"""
RBAC (Role-Based Access Control) Models
Multi-tenant permission system for Bienestar APP.

Architecture:
- User: Authentication entity (can be Professional or Client)
- UserRole: Maps users to roles within specific tenants
- Role/Permission enums: Define the access matrix
"""

import uuid
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional, List

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
    Boolean,
    Integer,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.db.connection import Base


# =============================================================================
# PERMISSION ENUMS
# =============================================================================

class Role(str, PyEnum):
    """
    Sistema de roles para control de acceso.
    Un usuario puede tener múltiples roles en diferentes tenants.
    """
    # Profesionales (B2B)
    NUTRITIONIST = "NUTRITIONIST"          # Nutricionista
    PERSONAL_TRAINER = "PERSONAL_TRAINER"  # Personal Trainer
    ADMIN = "ADMIN"                        # Admin del Tenant
    
    # Clientes (B2C) - Determinados por el tipo de suscripción
    CLIENT_NUTRITION = "CLIENT_NUTRITION"  # Cliente de Nutricionista
    CLIENT_FITNESS = "CLIENT_FITNESS"      # Cliente de PT
    CLIENT_HYBRID = "CLIENT_HYBRID"        # Cliente con ambos servicios


class Permission(str, PyEnum):
    """
    Permisos granulares para cada acción del sistema.
    Agrupados por módulo para facilitar la gestión.
    """
    # ═══════════════════════════════════════════════════════════════
    # DIET PLANNER (Módulo Nutrición)
    # ═══════════════════════════════════════════════════════════════
    DIET_CREATE = "diet:create"
    DIET_READ = "diet:read"
    DIET_EDIT = "diet:edit"
    DIET_DELETE = "diet:delete"
    DIET_CHECK = "diet:check"  # Solo marcar como completado
    
    # ═══════════════════════════════════════════════════════════════
    # WORKOUT BUILDER (Módulo Fitness)
    # ═══════════════════════════════════════════════════════════════
    WORKOUT_CREATE = "workout:create"
    WORKOUT_READ = "workout:read"
    WORKOUT_EDIT = "workout:edit"
    WORKOUT_DELETE = "workout:delete"
    WORKOUT_CHECK = "workout:check"  # Solo marcar como completado
    
    # ═══════════════════════════════════════════════════════════════
    # CLINICAL HISTORY (Historia Clínica)
    # ═══════════════════════════════════════════════════════════════
    CLINICAL_FULL = "clinical:full"        # Patologías, análisis
    CLINICAL_LIMITED = "clinical:limited"  # Solo lesiones
    CLINICAL_READ = "clinical:read"        # Solo lectura
    
    # ═══════════════════════════════════════════════════════════════
    # CHAT/MESSAGING
    # ═══════════════════════════════════════════════════════════════
    CHAT_NUTRITION = "chat:nutrition"  # Chat con nutricionista
    CHAT_FITNESS = "chat:fitness"      # Chat con PT
    CHAT_ALL = "chat:all"              # Chat general
    
    # ═══════════════════════════════════════════════════════════════
    # MARKETPLACE
    # ═══════════════════════════════════════════════════════════════
    MARKETPLACE_PRESCRIBE_SUPPLEMENTS = "marketplace:prescribe:supplements"
    MARKETPLACE_PRESCRIBE_EQUIPMENT = "marketplace:prescribe:equipment"
    MARKETPLACE_BUY_FOOD = "marketplace:buy:food"
    MARKETPLACE_BUY_EQUIPMENT = "marketplace:buy:equipment"
    
    # ═══════════════════════════════════════════════════════════════
    # CHECK-IN (Logging)
    # ═══════════════════════════════════════════════════════════════
    CHECKIN_VIEW_DIGESTION = "checkin:view:digestion"
    CHECKIN_VIEW_FATIGUE = "checkin:view:fatigue"
    CHECKIN_LOG_FOOD = "checkin:log:food"
    CHECKIN_LOG_WEIGHT = "checkin:log:weight"
    CHECKIN_LOG_LIFT = "checkin:log:lift"
    
    # ═══════════════════════════════════════════════════════════════
    # PHOTO REVIEW (Cola de revisión)
    # ═══════════════════════════════════════════════════════════════
    PHOTO_REVIEW_FOOD = "photo:review:food"
    PHOTO_REVIEW_TECHNIQUE = "photo:review:technique"
    
    # ═══════════════════════════════════════════════════════════════
    # ADMIN
    # ═══════════════════════════════════════════════════════════════
    ADMIN_TENANT = "admin:tenant"
    ADMIN_USERS = "admin:users"
    ADMIN_BILLING = "admin:billing"


# =============================================================================
# ROLE → PERMISSIONS MAPPING (La "Ley" del Sistema)
# =============================================================================

ROLE_PERMISSIONS: dict[Role, list[Permission]] = {
    # ═══════════════════════════════════════════════════════════════
    # NUTRICIONISTA: Editor Total de Dietas, Vista Clínica Completa
    # ═══════════════════════════════════════════════════════════════
    Role.NUTRITIONIST: [
        Permission.DIET_CREATE,
        Permission.DIET_READ,
        Permission.DIET_EDIT,
        Permission.DIET_DELETE,
        Permission.CLINICAL_FULL,
        Permission.CHAT_ALL,
        Permission.MARKETPLACE_PRESCRIBE_SUPPLEMENTS,
        Permission.CHECKIN_VIEW_DIGESTION,
        Permission.PHOTO_REVIEW_FOOD,
        Permission.ADMIN_USERS,  # Gestionar sus clientes
    ],
    
    # ═══════════════════════════════════════════════════════════════
    # PERSONAL TRAINER: Editor Total de Workouts, Vista Limitada de Clínica
    # ═══════════════════════════════════════════════════════════════
    Role.PERSONAL_TRAINER: [
        Permission.WORKOUT_CREATE,
        Permission.WORKOUT_READ,
        Permission.WORKOUT_EDIT,
        Permission.WORKOUT_DELETE,
        Permission.DIET_READ,  # Solo lectura de dieta (calorías)
        Permission.CLINICAL_LIMITED,  # Solo lesiones
        Permission.CHAT_ALL,
        Permission.MARKETPLACE_PRESCRIBE_EQUIPMENT,
        Permission.CHECKIN_VIEW_FATIGUE,
        Permission.PHOTO_REVIEW_TECHNIQUE,
        Permission.ADMIN_USERS,
    ],
    
    # ═══════════════════════════════════════════════════════════════
    # CLIENTE NUTRICIÓN: Lee dieta, marca check, sube fotos
    # ═══════════════════════════════════════════════════════════════
    Role.CLIENT_NUTRITION: [
        Permission.DIET_READ,
        Permission.DIET_CHECK,
        Permission.CLINICAL_READ,
        Permission.CHAT_NUTRITION,
        Permission.MARKETPLACE_BUY_FOOD,
        Permission.CHECKIN_LOG_FOOD,
        Permission.CHECKIN_LOG_WEIGHT,
    ],
    
    # ═══════════════════════════════════════════════════════════════
    # CLIENTE FITNESS: Lee rutina, marca check, sube videos
    # ═══════════════════════════════════════════════════════════════
    Role.CLIENT_FITNESS: [
        Permission.WORKOUT_READ,
        Permission.WORKOUT_CHECK,
        Permission.CLINICAL_READ,
        Permission.CHAT_FITNESS,
        Permission.MARKETPLACE_BUY_EQUIPMENT,
        Permission.CHECKIN_LOG_LIFT,
        Permission.CHECKIN_LOG_WEIGHT,
    ],
    
    # ═══════════════════════════════════════════════════════════════
    # CLIENTE HÍBRIDO: Ambos módulos desbloqueados
    # ═══════════════════════════════════════════════════════════════
    Role.CLIENT_HYBRID: [
        Permission.DIET_READ,
        Permission.DIET_CHECK,
        Permission.WORKOUT_READ,
        Permission.WORKOUT_CHECK,
        Permission.CLINICAL_READ,
        Permission.CHAT_NUTRITION,
        Permission.CHAT_FITNESS,
        Permission.MARKETPLACE_BUY_FOOD,
        Permission.MARKETPLACE_BUY_EQUIPMENT,
        Permission.CHECKIN_LOG_FOOD,
        Permission.CHECKIN_LOG_LIFT,
        Permission.CHECKIN_LOG_WEIGHT,
    ],
    
    # ═══════════════════════════════════════════════════════════════
    # ADMIN: Todo
    # ═══════════════════════════════════════════════════════════════
    Role.ADMIN: [p for p in Permission],
}


# =============================================================================
# USER MODEL (Autenticación Central)
# =============================================================================

class User(Base):
    """
    Usuario del sistema con autenticación.
    Puede tener múltiples roles en diferentes tenants.
    
    Ejemplo JWT payload:
    {
        "user_id": "u_999",
        "roles": [
            {"tenant_id": "t_nutri_karen", "role": "CLIENT_NUTRITION"},
            {"tenant_id": "t_gym_iron", "role": "CLIENT_FITNESS"}
        ]
    }
    """
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    
    # Auth (Supabase/Clerk external ID)
    auth_provider_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        comment="External auth provider user ID (Supabase, Clerk, etc.)"
    )
    
    # Local Auth Support
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Datos básicos
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Avatar para gamificación
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Gamificación global
    vital_points: Mapped[int] = mapped_column(Integer, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relaciones
    roles = relationship("UserRole", back_populates="user", lazy="selectin")
    patients = relationship("Patient", back_populates="professional", lazy="selectin")
    
    # Estado
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    def get_permissions_for_tenant(self, tenant_id: uuid.UUID) -> list[Permission]:
        """Obtiene todos los permisos del usuario para un tenant específico."""
        permissions = []
        for user_role in self.roles:
            if user_role.tenant_id == tenant_id and user_role.is_active:
                role_perms = ROLE_PERMISSIONS.get(user_role.role, [])
                permissions.extend(role_perms)
        return list(set(permissions))  # Eliminar duplicados
    
    def has_permission(self, tenant_id: uuid.UUID, permission: Permission) -> bool:
        """Verifica si el usuario tiene un permiso específico en un tenant."""
        return permission in self.get_permissions_for_tenant(tenant_id)


# =============================================================================
# USER ROLE (Mapeo Multi-Tenant)
# =============================================================================

class UserRole(Base):
    """
    Mapeo de Usuario → Rol → Tenant.
    Permite que un usuario tenga diferentes roles en diferentes tenants.
    
    Ejemplo:
    - María es CLIENTE de NutriKaren (tenant_1)
    - María es CLIENTE de GymMax (tenant_2)
    - Juan es NUTRICIONISTA en su propio tenant (tenant_3)
    """
    __tablename__ = "user_roles"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )
    
    role: Mapped[Role] = mapped_column(
        Enum(Role),
        nullable=False
    )
    
    # Referencia al profesional que lo invitó (si aplica)
    assigned_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("professionals.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Estado
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="Fecha de expiración de la suscripción"
    )
    
    # Relaciones
    user = relationship("User", back_populates="roles")
    tenant = relationship("Tenant")
    assigned_by = relationship("Professional")
    
    __table_args__ = (
        Index("ix_user_roles_user_tenant", "user_id", "tenant_id"),
        Index("ix_user_roles_tenant_role", "tenant_id", "role"),
    )


# =============================================================================
# INVITATION (Sistema de Invitación)
# =============================================================================

class Invitation(Base):
    """
    Invitación para vincular un cliente con un profesional.
    
    Flujo:
    1. Profesional genera link: app.aurea.health/invite/nutri/juan-perez
    2. Cliente acepta → Se crea UserRole con el rol correspondiente
    3. Se desbloquea el módulo en la app del cliente
    """
    __tablename__ = "invitations"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    
    # Token único para el link de invitación
    token: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False
    )
    
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )
    
    professional_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("professionals.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Rol que se asignará al aceptar
    target_role: Mapped[Role] = mapped_column(
        Enum(Role),
        nullable=False
    )
    
    # Datos opcionales del invitado
    invited_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    invited_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Estado
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    used_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relaciones
    tenant = relationship("Tenant")
    professional = relationship("Professional")
    used_by = relationship("User")
    
    __table_args__ = (
        Index("ix_invitations_token", "token"),
    )

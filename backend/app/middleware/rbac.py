"""
RBAC Middleware - Permission-Based Route Protection
Integrates with existing auth.py to add granular permission checking.

Usage:
    @router.get("/diet/{id}")
    @require_permissions(Permission.DIET_READ)
    async def get_diet(id: str, user: TokenData = Depends(get_current_user)):
        ...
        
    @router.post("/diet")
    @require_permissions(Permission.DIET_CREATE, Permission.DIET_EDIT)
    async def create_diet(...):
        ...
"""

from functools import wraps
from typing import Callable, Optional, List
from uuid import UUID

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.rbac import Permission, Role, User, UserRole, ROLE_PERMISSIONS
from app.middleware.auth import get_current_user, TokenData
from app.config import get_settings

settings = get_settings()


# =============================================================================
# PERMISSION CHECKING
# =============================================================================

async def get_user_permissions(
    db: AsyncSession,
    user_id: UUID,
    tenant_id: UUID
) -> list[Permission]:
    """
    Obtiene todos los permisos de un usuario para un tenant específico.
    """
    result = await db.execute(
        select(UserRole).where(
            UserRole.user_id == user_id,
            UserRole.tenant_id == tenant_id,
            UserRole.is_active == True
        )
    )
    user_roles = result.scalars().all()
    
    permissions = []
    for user_role in user_roles:
        role_perms = ROLE_PERMISSIONS.get(user_role.role, [])
        permissions.extend(role_perms)
    
    return list(set(permissions))


def has_permission(permissions: list[Permission], required: Permission) -> bool:
    """Verifica si una lista de permisos contiene el permiso requerido."""
    return required in permissions


def has_all_permissions(permissions: list[Permission], required: list[Permission]) -> bool:
    """Verifica si una lista de permisos contiene TODOS los permisos requeridos."""
    return all(has_permission(permissions, p) for p in required)


def has_any_permission(permissions: list[Permission], required: list[Permission]) -> bool:
    """Verifica si una lista de permisos contiene AL MENOS UNO de los permisos requeridos."""
    return any(has_permission(permissions, p) for p in required)


# =============================================================================
# DEPENDENCY FACTORIES
# =============================================================================

def require_permissions(*required_permissions: Permission, require_all: bool = True):
    """
    Dependency factory para requerir permisos específicos.
    
    Args:
        *required_permissions: Permisos requeridos
        require_all: Si True, requiere TODOS los permisos. Si False, al menos uno.
    
    Usage:
        @router.get("/diet/{id}")
        async def get_diet(
            id: str,
            user: TokenData = Depends(get_current_user),
            _: None = Depends(require_permissions(Permission.DIET_READ))
        ):
            ...
    """
    async def permission_checker(
        current_user: TokenData = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ):
        # Obtener permisos del usuario para el tenant actual
        user_permissions = await get_user_permissions(
            db, 
            current_user.user_id, 
            current_user.tenant_id
        )
        
        # Verificar permisos
        if require_all:
            if not has_all_permissions(user_permissions, list(required_permissions)):
                missing = [p.value for p in required_permissions if p not in user_permissions]
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permisos insuficientes. Faltan: {', '.join(missing)}"
                )
        else:
            if not has_any_permission(user_permissions, list(required_permissions)):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes ninguno de los permisos requeridos"
                )
        
        return user_permissions
    
    return permission_checker


def require_role(*required_roles: Role):
    """
    Dependency factory para requerir roles específicos.
    
    Usage:
        @router.get("/admin/users")
        async def list_users(
            _: None = Depends(require_role(Role.ADMIN, Role.NUTRITIONIST))
        ):
            ...
    """
    async def role_checker(
        current_user: TokenData = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ):
        result = await db.execute(
            select(UserRole).where(
                UserRole.user_id == current_user.user_id,
                UserRole.tenant_id == current_user.tenant_id,
                UserRole.is_active == True
            )
        )
        user_roles = result.scalars().all()
        
        user_role_types = [ur.role for ur in user_roles]
        
        if not any(r in user_role_types for r in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de estos roles: {', '.join([r.value for r in required_roles])}"
            )
        
        return user_role_types
    
    return role_checker


# =============================================================================
# ROLE-SPECIFIC DEPENDENCIES
# =============================================================================

async def require_nutritionist(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> TokenData:
    """Dependency: Requiere rol de Nutricionista."""
    from app.config import get_settings
    settings = get_settings()
    
    # 🔓 DEV MODE BYPASS: Skip DB query entirely if in dev mode with valid JWT role
    if settings.debug or settings.environment != "production":
        if current_user.role.lower() in ("nutritionist", "admin", "superuser", "super_admin"):
            return current_user
    
    # Production mode: verify against database
    try:
        result = await db.execute(
            select(UserRole).where(
                UserRole.user_id == current_user.user_id,
                UserRole.tenant_id == current_user.tenant_id,
                UserRole.role == Role.NUTRITIONIST,
                UserRole.is_active == True
            )
        )
        if result.scalar_one_or_none():
            return current_user
    except Exception:
        # DB connection failed - in dev mode we already returned, so this is production
        pass
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Se requiere rol de Nutricionista"
    )



async def require_personal_trainer(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> TokenData:
    """Dependency: Requiere rol de Personal Trainer."""
    from app.config import get_settings
    settings = get_settings()

    # 🔓 DEV MODE BYPASS: Skip DB query entirely if in dev mode with valid JWT role
    if settings.debug or settings.environment != "production":
        if current_user.role.lower() in ("personal_trainer", "admin", "superuser", "super_admin"):
            return current_user

    try:
        result = await db.execute(
            select(UserRole).where(
                UserRole.user_id == current_user.user_id,
                UserRole.tenant_id == current_user.tenant_id,
                UserRole.role == Role.PERSONAL_TRAINER,
                UserRole.is_active == True
            )
        )
        if result.scalar_one_or_none():
            return current_user
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Se requiere rol de Personal Trainer"
    )


async def require_professional(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> TokenData:
    """Dependency: Requiere rol de profesional (Nutricionista o PT)."""
    from app.config import get_settings
    settings = get_settings()

    # 🔓 DEV MODE BYPASS
    if settings.debug or settings.environment != "production":
        if current_user.role.lower() in ("nutritionist", "personal_trainer", "admin", "superuser", "super_admin"):
            return current_user
            
    try:
        result = await db.execute(
            select(UserRole).where(
                UserRole.user_id == current_user.user_id,
                UserRole.tenant_id == current_user.tenant_id,
                UserRole.role.in_([Role.NUTRITIONIST, Role.PERSONAL_TRAINER, Role.ADMIN]),
                UserRole.is_active == True
            )
        )
        if result.scalar_one_or_none():
            return current_user
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Se requiere rol de profesional"
    )


# =============================================================================
# CONTEXT CLASS WITH PERMISSION HELPERS
# =============================================================================

class RBACContext:
    """
    Contexto RBAC completo para usar en endpoints.
    Proporciona helpers para verificación de permisos.
    """
    
    def __init__(
        self, 
        user: TokenData, 
        permissions: list[Permission],
        roles: list[Role]
    ):
        self.user = user
        self.permissions = permissions
        self.roles = roles
    
    def can(self, permission: Permission) -> bool:
        """Verifica si el usuario tiene un permiso específico."""
        return permission in self.permissions
    
    def can_any(self, *permissions: Permission) -> bool:
        """Verifica si el usuario tiene al menos uno de los permisos."""
        return any(p in self.permissions for p in permissions)
    
    def can_all(self, *permissions: Permission) -> bool:
        """Verifica si el usuario tiene todos los permisos."""
        return all(p in self.permissions for p in permissions)
    
    def is_nutritionist(self) -> bool:
        return Role.NUTRITIONIST in self.roles
    
    def is_personal_trainer(self) -> bool:
        return Role.PERSONAL_TRAINER in self.roles
    
    def is_client(self) -> bool:
        return any(r in self.roles for r in [
            Role.CLIENT_NUTRITION, 
            Role.CLIENT_FITNESS, 
            Role.CLIENT_HYBRID
        ])
    
    def is_admin(self) -> bool:
        return Role.ADMIN in self.roles


async def get_rbac_context(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> RBACContext:
    """
    Dependency: Obtiene contexto RBAC completo.
    
    Usage:
        @router.get("/dashboard")
        async def dashboard(rbac: RBACContext = Depends(get_rbac_context)):
            if rbac.is_nutritionist():
                return nutritionist_dashboard()
            elif rbac.is_personal_trainer():
                return trainer_dashboard()
            else:
                return client_dashboard()
    """
    # Obtener roles del usuario
    result = await db.execute(
        select(UserRole).where(
            UserRole.user_id == current_user.user_id,
            UserRole.tenant_id == current_user.tenant_id,
            UserRole.is_active == True
        )
    )
    user_roles = result.scalars().all()
    roles = [ur.role for ur in user_roles]
    
    # Obtener permisos
    permissions = []
    for role in roles:
        permissions.extend(ROLE_PERMISSIONS.get(role, []))
    permissions = list(set(permissions))
    
    return RBACContext(
        user=current_user,
        permissions=permissions,
        roles=roles
    )

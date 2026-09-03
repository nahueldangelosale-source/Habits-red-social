import re
import uuid
import secrets
import httpx
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.config import get_settings
from app.db.rbac import User, UserRole, Role
from app.db.models import Tenant, Professional, Client
from app.middleware.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    TokenData
)

router = APIRouter()


# ─── Helper Functions ────────────────────────────────────────────────────────

def _slugify(text: str) -> str:
    """Generate a clean URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-') or 'org'


async def _generate_unique_tenant_slug(db: AsyncSession, base_name: str) -> str:
    """Generates a guaranteed unique slug for a tenant."""
    base_slug = _slugify(base_name)
    slug = base_slug
    
    # Check if slug exists
    res = await db.execute(select(Tenant).where(Tenant.slug == slug))
    if not res.scalars().first():
        return slug
        
    # Append random suffix if conflict
    for _ in range(5):
        suffix = secrets.token_hex(2)
        slug = f"{base_slug}-{suffix}"
        res = await db.execute(select(Tenant).where(Tenant.slug == slug))
        if not res.scalars().first():
            return slug
            
    return f"{base_slug}-{uuid.uuid4().hex[:8]}"


# ─── Request / Response Schemas ──────────────────────────────────────────────

class CoachRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    first_name: Optional[str] = Field("Coach", max_length=100)
    last_name: Optional[str] = Field("", max_length=100)
    phone: Optional[str] = None
    business_name: Optional[str] = Field(None, description="Gym or Brand Name")
    specialty: Optional[str] = Field("PERSONAL_TRAINER", description="PERSONAL_TRAINER, NUTRITIONIST, or HYBRID")


class B2CClientRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    gym_slug: Optional[str] = Field(None, description="Optional tenant slug to affiliate with")


class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., description="Google ID Token JWT")
    role: Optional[str] = Field("ADMIN", description="ADMIN (Coach) or CLIENT_FITNESS (Athlete)")
    specialty: Optional[str] = Field("PERSONAL_TRAINER", description="Coach specialty if new")


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    business_name: Optional[str] = None
    specialty: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Login endpoint using OAuth2 Password Request Form.
    Validates user credentials, retrieves tenant role, and issues JWT access token.
    """
    result = await db.execute(select(User).where(User.email == form_data.username.strip().lower()))
    user = result.scalars().first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Get user roles to find tenant and role
    result_roles = await db.execute(select(UserRole).where(UserRole.user_id == user.id))
    roles = result_roles.scalars().all()
    
    if roles:
        tenant_id = roles[0].tenant_id
        role_str = str(roles[0].role.value)
    else:
        # Fallback: Find first tenant or create default
        tenant_result = await db.execute(select(Tenant).limit(1))
        tenant = tenant_result.scalars().first()
        if not tenant:
            tenant = Tenant(name="Comunidad Bienestar", slug="comunidad-bienestar")
            db.add(tenant)
            await db.commit()
            await db.refresh(tenant)
        tenant_id = tenant.id
        role_str = "ADMIN"
        
    access_token = create_access_token(
        user_id=user.id,
        tenant_id=tenant_id,
        role=role_str
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "tenant_id": str(tenant_id),
            "role": role_str,
        }
    }


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_coach(
    payload: CoachRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Public Registration for Coaches / Personal Trainers / Nutritionists.
    Provisions Tenant + User + Professional + UserRole(ADMIN) in a single atomic transaction.
    """
    normalized_email = payload.email.strip().lower()
    
    # 1. Check if user email is already registered
    existing_user = await db.execute(select(User).where(User.email == normalized_email))
    if existing_user.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este correo electrónico ya está registrado. Por favor iniciá sesión."
        )

    # 2. Provision Tenant (Organization)
    f_name = (payload.first_name or "Coach").strip() or "Coach"
    l_name = (payload.last_name or "").strip()
    org_name = payload.business_name.strip() if payload.business_name else f"Gym {f_name} {l_name}".strip()
    tenant_slug = await _generate_unique_tenant_slug(db, org_name)
    
    tenant = Tenant(
        name=org_name,
        slug=tenant_slug,
        settings={"created_via": "self_register_coach"}
    )
    db.add(tenant)
    await db.flush()

    # 3. Create User
    hashed_pwd = get_password_hash(payload.password)
    user = User(
        email=normalized_email,
        hashed_password=hashed_pwd,
        first_name=f_name,
        last_name=l_name,
        phone=payload.phone.strip() if payload.phone else None,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    await db.flush()

    # 4. Create Professional
    prof_specialty = payload.specialty if payload.specialty in ["PERSONAL_TRAINER", "NUTRITIONIST", "HYBRID"] else "PERSONAL_TRAINER"
    professional = Professional(
        tenant_id=tenant.id,
        auth_user_id=str(user.id),
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        specialty=prof_specialty,
        role="ADMIN",
        subscription_status="active"
    )
    db.add(professional)
    await db.flush()

    # 5. Assign UserRole (ADMIN of new tenant)
    user_role = UserRole(
        user_id=user.id,
        tenant_id=tenant.id,
        role=Role.ADMIN,
        assigned_by_id=professional.id,
        is_active=True
    )
    db.add(user_role)
    
    await db.commit()
    await db.refresh(user)
    await db.refresh(tenant)

    # 6. Issue JWT Access Token
    access_token = create_access_token(
        user_id=user.id,
        tenant_id=tenant.id,
        role="ADMIN"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "tenant_id": str(tenant.id),
            "role": "ADMIN",
            "business_name": tenant.name
        }
    }


@router.post("/register-b2c", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_b2c_client(
    payload: B2CClientRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Public Self-Registration for Standalone (B2C) Athletes.
    Provisions User + Client + UserRole(CLIENT_FITNESS).
    """
    normalized_email = payload.email.strip().lower()

    # 1. Check if user already exists
    existing_user = await db.execute(select(User).where(User.email == normalized_email))
    if existing_user.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este correo electrónico ya está registrado. Por favor iniciá sesión."
        )

    # 2. Resolve Tenant
    tenant = None
    if payload.gym_slug:
        res = await db.execute(select(Tenant).where(Tenant.slug == payload.gym_slug.strip().lower()))
        tenant = res.scalars().first()

    if not tenant:
        # Default global B2C tenant
        res_default = await db.execute(select(Tenant).where(Tenant.slug == "comunidad-bienestar"))
        tenant = res_default.scalars().first()
        if not tenant:
            tenant = Tenant(
                name="Comunidad Bienestar",
                slug="comunidad-bienestar",
                settings={"type": "global_b2c_pool"}
            )
            db.add(tenant)
            await db.flush()

    # 3. Create User
    hashed_pwd = get_password_hash(payload.password)
    user = User(
        email=normalized_email,
        hashed_password=hashed_pwd,
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    await db.flush()

    # 4. Create Client Record
    client = Client(
        tenant_id=tenant.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        extra_data={"registered_via": "self_register_b2c"}
    )
    db.add(client)
    await db.flush()

    # 5. Assign UserRole
    user_role = UserRole(
        user_id=user.id,
        tenant_id=tenant.id,
        role=Role.CLIENT_FITNESS,
        is_active=True
    )
    db.add(user_role)

    await db.commit()
    await db.refresh(user)

    # 6. Issue Access Token
    access_token = create_access_token(
        user_id=user.id,
        tenant_id=tenant.id,
        role="CLIENT_FITNESS"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "tenant_id": str(tenant.id),
            "role": "CLIENT_FITNESS",
        }
    }


@router.get("/whoami")
async def get_whoami(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Returns profile and role metadata for the current session."""
    result = await db.execute(select(User).where(User.id == current_user.user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    return {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.full_name,
        "role": current_user.role,
        "tenant_id": str(current_user.tenant_id),
        "subscription_tier": "Elite",
        "subscription_status": "active",
        "payment_provider": "stripe"
    }


@router.post("/google", response_model=AuthResponse)
async def google_auth(
    body: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate or Register via Google OAuth ID Token (Google 1-Tap / Sign-In).
    Validates token with Google API, auto-provisions Tenant & User if new,
    and returns platform JWT access token.
    """
    credential = body.credential.strip()
    if not credential:
        raise HTTPException(status_code=400, detail="Token de Google requerido")

    # 1. Verify token with Google's tokeninfo endpoint
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}")
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Token de Google inválido o expirado")
            google_data = resp.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Error al conectar con Google: {str(e)}")

    # Validate audience claim — reject tokens issued for other applications
    expected_client_id = get_settings().google_client_id
    if expected_client_id and google_data.get("aud") != expected_client_id:
        raise HTTPException(
            status_code=401,
            detail="Token de Google no autorizado para esta aplicación"
        )

    email = google_data.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="El token de Google no contiene un email válido")

    first_name = google_data.get("given_name") or (google_data.get("name", "").split()[0] if google_data.get("name") else "Coach")
    last_name = google_data.get("family_name") or (" ".join(google_data.get("name", "").split()[1:]) if google_data.get("name") else "")

    # 2. Check if user already exists
    user_res = await db.execute(select(User).where(User.email == email))
    user = user_res.scalars().first()

    if user:
        # Existing user: get active role and tenant
        role_res = await db.execute(
            select(UserRole).where(UserRole.user_id == user.id, UserRole.is_active == True)
        )
        user_role = role_res.scalars().first()
        
        tenant_id = user_role.tenant_id if user_role else user.id
        role_str = user_role.role.value if user_role and hasattr(user_role.role, 'value') else (str(user_role.role) if user_role else "ADMIN")

        access_token = create_access_token(
            user_id=user.id,
            tenant_id=tenant_id,
            role=role_str
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "tenant_id": str(tenant_id),
                "role": role_str,
                "is_new_user": False
            }
        }

    # 3. New User Auto-provisioning (1-Click Account Creation)
    if body.role == "CLIENT_FITNESS":
        # Atleta
        tenant_res = await db.execute(select(Tenant).where(Tenant.slug == "comunidad-bienestar"))
        tenant = tenant_res.scalars().first()
        if not tenant:
            tenant = Tenant(name="Comunidad Bienestar", slug="comunidad-bienestar")
            db.add(tenant)
            await db.flush()

        user = User(
            email=email,
            hashed_password=get_password_hash(secrets.token_hex(16)),
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )
        db.add(user)
        await db.flush()

        client_rec = Client(
            tenant_id=tenant.id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            extra_data={"registered_via": "google_oauth"}
        )
        db.add(client_rec)
        await db.flush()

        user_role = UserRole(
            user_id=user.id,
            tenant_id=tenant.id,
            role=Role.CLIENT_FITNESS,
            is_active=True
        )
        db.add(user_role)
        await db.commit()
        await db.refresh(user)

        access_token = create_access_token(
            user_id=user.id,
            tenant_id=tenant.id,
            role="CLIENT_FITNESS"
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "tenant_id": str(tenant.id),
                "role": "CLIENT_FITNESS",
                "is_new_user": True
            }
        }
    else:
        # Coach / Admin
        brand_name = f"{first_name} {last_name}".strip() or "Habits Space"
        slug = await _generate_unique_tenant_slug(db, brand_name)
        tenant = Tenant(name=brand_name, slug=slug)
        db.add(tenant)
        await db.flush()

        user = User(
            email=email,
            hashed_password=get_password_hash(secrets.token_hex(16)),
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )
        db.add(user)
        await db.flush()

        prof = Professional(
            tenant_id=tenant.id,
            auth_user_id=str(user.id),
            first_name=first_name,
            last_name=last_name,
            email=user.email,
            specialty=body.specialty or "PERSONAL_TRAINER",
            role="ADMIN",
            subscription_status="active"
        )
        db.add(prof)
        await db.flush()

        user_role = UserRole(
            user_id=user.id,
            tenant_id=tenant.id,
            role=Role.ADMIN,
            is_active=True
        )
        db.add(user_role)
        await db.commit()
        await db.refresh(user)

        access_token = create_access_token(
            user_id=user.id,
            tenant_id=tenant.id,
            role="ADMIN"
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "tenant_id": str(tenant.id),
                "role": "ADMIN",
                "is_new_user": True
            }
        }


@router.patch("/profile")
async def update_profile(
    body: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Progressive Profiling update endpoint.
    Allows updating first name, last name, gym brand name, and specialty.
    """
    result = await db.execute(select(User).where(User.id == current_user.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if body.first_name is not None:
        user.first_name = body.first_name.strip()
    if body.last_name is not None:
        user.last_name = body.last_name.strip()

    if body.business_name and current_user.tenant_id:
        t_res = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
        tenant = t_res.scalars().first()
        if tenant:
            tenant.name = body.business_name.strip()

    if body.specialty:
        p_res = await db.execute(select(Professional).where(Professional.auth_user_id == str(user.id)))
        prof = p_res.scalars().first()
        if prof:
            prof.specialty = body.specialty.strip()

    await db.commit()
    await db.refresh(user)

    return {
        "status": "success",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": user.full_name,
            "role": current_user.role,
            "tenant_id": str(current_user.tenant_id)
        }
    }

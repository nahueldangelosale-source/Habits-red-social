from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.db.connection import get_db
from app.db.models import Professional, Tenant
from app.middleware.auth import (
    get_current_admin,
    get_tenant_context,
    TenantContext,
    create_invitation_token
)
from app.services.email import get_email_provider
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/professionals", tags=["professionals"])

class ProfessionalCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    role: str

class ProfessionalResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    role: str
    specialty: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProfessionalResponse])
async def list_professionals(
    tenant_context: TenantContext = Depends(get_tenant_context),
    db: AsyncSession = Depends(get_db)
):
    query = select(Professional).where(Professional.tenant_id == tenant_context.tenant_id)
    result = await db.execute(query)
    professionals = result.scalars().all()
    return professionals

@router.post("/", response_model=ProfessionalResponse)
async def invite_professional(
    data: ProfessionalCreate,
    admin_user = Depends(get_current_admin),
    tenant_context: TenantContext = Depends(get_tenant_context),
    db: AsyncSession = Depends(get_db)
):
    # Check if professional already exists
    query = select(Professional).where(Professional.email == data.email)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Professional with this email already exists")

    # Get Tenant name
    tenant_query = select(Tenant).where(Tenant.id == tenant_context.tenant_id)
    tenant_result = await db.execute(tenant_query)
    tenant = tenant_result.scalar_one_or_none()
    tenant_name = tenant.name if tenant else "AUREA Bienestar"

    # Create professional
    new_pro = Professional(
        tenant_id=tenant_context.tenant_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        role=data.role,
        specialty="fitness"
    )
    db.add(new_pro)
    await db.commit()
    await db.refresh(new_pro)

    # Generate transient JWT and send email
    token = create_invitation_token(email=data.email, role=data.role, tenant_id=tenant_context.tenant_id)
    
    email_provider = get_email_provider()
    await email_provider.send_invitation(email=data.email, token=token, tenant_name=tenant_name)

    return new_pro

@router.delete("/{pro_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_professional(
    pro_id: uuid.UUID,
    admin_user = Depends(get_current_admin),
    tenant_context: TenantContext = Depends(get_tenant_context),
    db: AsyncSession = Depends(get_db)
):
    query = select(Professional).where(
        Professional.id == pro_id,
        Professional.tenant_id == tenant_context.tenant_id
    )
    result = await db.execute(query)
    pro = result.scalar_one_or_none()
    
    if not pro:
        raise HTTPException(status_code=404, detail="Professional not found")
        
    await db.delete(pro)
    await db.commit()
    return None

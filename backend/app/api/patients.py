from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
from typing import Any, List

from app.db.database import get_db
from app.db.models import Client, Professional
from app.middleware.auth import get_current_user, TokenData

router = APIRouter()

@router.post("/athletes", status_code=status.HTTP_201_CREATED)
@router.post("/patients", status_code=status.HTTP_201_CREATED)
async def create_athlete(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Create a new athlete (Client).
    Called by the ZeroClientWizardPT onboarding flow.
    """
    tenant_id = current_user.tenant_id
    
    # Resolve professional_id from Professional table
    prof_res = await db.execute(
        select(Professional).where(
            (Professional.auth_user_id == str(current_user.user_id)) |
            (Professional.id == current_user.user_id)
        )
    )
    prof = prof_res.scalars().first()
    professional_id = prof.id if prof else None
    
    # Check for duplicate email within tenant
    email = payload.get("email")
    if email:
        existing = await db.execute(
            select(Client).where(
                Client.tenant_id == tenant_id,
                Client.email == email
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An athlete with this email already exists in your roster."
            )
    
    extra_data = payload.get("extra_data", {})
    # Inyectar biometría para el parser del frontend
    extra_data["biometrics"] = {
        "age": payload.get("age"),
        "weight": payload.get("weight_kg"),
        "height": payload.get("height_cm"),
    }
    
    new_client = Client(
        tenant_id=tenant_id,
        professional_id=professional_id,
        first_name=payload.get("first_name", "Unknown"),
        last_name=payload.get("last_name", "Athlete"),
        email=email,
        height_cm=payload.get("height_cm"),
        extra_data=extra_data
    )
    
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    
    return {
        "status": "success",
        "athlete_id": str(new_client.id),
        "name": f"{new_client.first_name} {new_client.last_name}"
    }

@router.get("/patients")
async def get_patients(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    List all patients/athletes for the current tenant.
    Returns {items: [...]} shape expected by frontend trainer.ts.
    """
    tenant_id = current_user.tenant_id
    
    result = await db.execute(
        select(Client)
        .where(Client.tenant_id == tenant_id)
        .order_by(Client.created_at.desc())
        .limit(limit)
    )
    clients = result.scalars().all()
    
    items = []
    for c in clients:
        items.append({
            "id": str(c.id),
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "is_active": True,
            "acwr_status": "SWEET_SPOT",
            "acwr_color": "emerald",
            "acwr_value": 1.0,
            "extra_data": c.extra_data if c.extra_data is not None else {}
        })
    
    return {"items": items, "total": len(items)}

@router.delete("/patients/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> None:
    """
    Delete a patient (Client) by ID.
    """
    tenant_id = current_user.tenant_id
    
    result = await db.execute(
        select(Client).where(
            Client.id == patient_id,
            Client.tenant_id == tenant_id
        )
    )
    client_to_delete = result.scalar_one_or_none()
    
    if not client_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or you do not have permission to delete it."
        )
        
    await db.delete(client_to_delete)
    await db.commit()

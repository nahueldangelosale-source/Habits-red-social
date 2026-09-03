"""
Finance API Router — Endpoints de Finanzas del Entrenador, Catálogo de Planes y Cobranzas.
"""

import uuid
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.services.finance_service import FinanceService


router = APIRouter(prefix="/api/v1/finance", tags=["finance"])


# ═══════════════════════════════════════════════════════════════
# PYDANTIC SCHEMAS
# ═══════════════════════════════════════════════════════════════

class CommercialPlanResponse(BaseModel):
    id: str
    name: str
    category: str
    tier: str
    price: float
    currency: str
    frequency: str
    duration_text: str
    description: str
    badge: Optional[str] = None
    features: List[str] = []
    is_active: bool

    class Config:
        from_attributes = True


class CreatePlanRequest(BaseModel):
    name: str
    category: str = "RECURRING"
    tier: str = "PRO"
    price: float
    currency: str = "ARS"
    frequency: str = "MONTHLY"
    duration_text: str = "Mensual recurrente"
    description: str = ""
    badge: Optional[str] = None
    features: List[str] = Field(default_factory=list)


class UpdatePlanRequest(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    badge: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ClientMembershipResponse(BaseModel):
    id: str
    client_id: str
    plan_name: str
    tier: str
    monthly_amount: float
    status: str
    last_payment_date: Optional[str] = None
    days_overdue: int
    enrolled_date: str

    class Config:
        from_attributes = True


class RecordPaymentRequest(BaseModel):
    amount: float
    currency: str = "ARS"
    payment_method: str = "TRANSFER"  # 'TRANSFER', 'CASH', 'MERCADOPAGO', 'STRIPE'
    notes: Optional[str] = None


class BatchSyncFinanceRequest(BaseModel):
    plans: List[Dict[str, Any]] = Field(default_factory=list)
    clients: List[Dict[str, Any]] = Field(default_factory=list)


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.get("/overview")
async def get_finance_overview(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Devuelve las métricas consolidadas de MRR, morosidad y retención del coach."""
    overview = await FinanceService.get_finance_overview(db, current_user.tenant_id)
    return overview


@router.get("/plans", response_model=List[CommercialPlanResponse])
async def list_commercial_plans(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Lista todos los planes comerciales activos del entrenador."""
    plans = await FinanceService.get_commercial_plans(db, current_user.tenant_id)
    return [
        CommercialPlanResponse(
            id=str(p.id),
            name=p.name,
            category=p.category,
            tier=p.tier,
            price=p.price,
            currency=p.currency,
            frequency=p.frequency,
            duration_text=p.duration_text,
            description=p.description,
            badge=p.badge,
            features=p.features or [],
            is_active=p.is_active,
        )
        for p in plans
    ]


@router.post("/plans", response_model=CommercialPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_commercial_plan(
    payload: CreatePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Crea un nuevo plan comercial."""
    plan = await FinanceService.create_commercial_plan(
        db=db,
        tenant_id=current_user.tenant_id,
        name=payload.name,
        category=payload.category,
        tier=payload.tier,
        price=payload.price,
        currency=payload.currency,
        frequency=payload.frequency,
        duration_text=payload.duration_text,
        description=payload.description,
        badge=payload.badge,
        features=payload.features,
    )
    return CommercialPlanResponse(
        id=str(plan.id),
        name=plan.name,
        category=plan.category,
        tier=plan.tier,
        price=plan.price,
        currency=plan.currency,
        frequency=plan.frequency,
        duration_text=plan.duration_text,
        description=plan.description,
        badge=plan.badge,
        features=plan.features or [],
        is_active=plan.is_active,
    )


@router.put("/plans/{plan_id}", response_model=CommercialPlanResponse)
async def update_commercial_plan(
    plan_id: str,
    payload: UpdatePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Actualiza precio o detalles de un plan comercial."""
    try:
        plan = await FinanceService.update_commercial_plan(
            db=db,
            plan_id=uuid.UUID(plan_id),
            tenant_id=current_user.tenant_id,
            name=payload.name,
            price=payload.price,
            description=payload.description,
            badge=payload.badge,
            features=payload.features,
            is_active=payload.is_active,
        )
        return CommercialPlanResponse(
            id=str(plan.id),
            name=plan.name,
            category=plan.category,
            tier=plan.tier,
            price=plan.price,
            currency=plan.currency,
            frequency=plan.frequency,
            duration_text=plan.duration_text,
            description=plan.description,
            badge=plan.badge,
            features=plan.features or [],
            is_active=plan.is_active,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Plan not found")


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_commercial_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> None:
    """Desactiva un plan comercial (soft-delete)."""
    success = await FinanceService.delete_commercial_plan(
        db, uuid.UUID(plan_id), current_user.tenant_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Plan not found")


@router.get("/clients", response_model=List[ClientMembershipResponse])
async def list_client_memberships(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Lista todos los alumnos con sus planes, montos y estados de cobro."""
    memberships = await FinanceService.get_client_memberships(db, current_user.tenant_id)
    return [
        ClientMembershipResponse(
            id=str(m.id),
            client_id=str(m.client_id),
            plan_name=m.plan_name,
            tier=m.tier,
            monthly_amount=m.monthly_amount,
            status=m.status,
            last_payment_date=m.last_payment_date.isoformat() if m.last_payment_date else None,
            days_overdue=m.days_overdue,
            enrolled_date=m.enrolled_date.isoformat() if m.enrolled_date else "",
        )
        for m in memberships
    ]


@router.post("/memberships/{membership_id}/record-payment")
async def record_payment(
    membership_id: str,
    payload: RecordPaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Registra el cobro de la cuota de un alumno en 1 toque."""
    try:
        membership, record = await FinanceService.record_client_payment(
            db=db,
            tenant_id=current_user.tenant_id,
            membership_id=uuid.UUID(membership_id),
            amount=payload.amount,
            currency=payload.currency,
            payment_method=payload.payment_method,
            notes=payload.notes,
        )
        return {
            "membership_id": str(membership.id),
            "status": membership.status,
            "days_overdue": membership.days_overdue,
            "last_payment_date": membership.last_payment_date.isoformat() if membership.last_payment_date else None,
            "payment_record_id": str(record.id),
        }
    except ValueError:
        raise HTTPException(status_code=404, detail="Membership not found")


@router.post("/sync-batch")
async def sync_finance_batch(
    payload: BatchSyncFinanceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Sincroniza en lote catálogo de planes y clientes desde el frontend."""
    result = await FinanceService.sync_finance_batch(
        db=db,
        tenant_id=current_user.tenant_id,
        plans=payload.plans,
        clients=payload.clients,
    )
    return result

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any

from app.db.database import get_db
from app.db.models import Client, Tenant
from app.middleware.auth import get_current_user, TokenData

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get dashboard KPI metrics.
    Returns the shape expected by the frontend trainer.ts getDashboard().
    """
    # Athletes/Clients should not see coach KPIs
    if current_user.role in ["CLIENT_FITNESS", "ATHLETE", "PATIENT"]:
        return {
            "tenant_name": "Bienestar APP",
            "kpis": {
                "active_clients": 0,
                "videos_pending_review": 0,
                "retention_rate": 0,
                "monthly_revenue": 0
            },
            "revenue": {
                "mrr": 0,
                "growth_rate": 0
            }
        }

    tenant_id = current_user.tenant_id
    
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = tenant_res.scalars().first()
    
    # Global B2C pool is not a coach tenant
    if tenant and tenant.slug == "comunidad-bienestar":
        active_clients = 0
    else:
        # Count active clients belonging to this coach, excluding test accounts
        result = await db.execute(
            select(func.count(Client.id))
            .where(
                Client.tenant_id == tenant_id,
                ~Client.email.like("test_%"),
                ~Client.email.like("atleta_libre_%")
            )
        )
        active_clients = result.scalar() or 0
    
    return {
        "tenant_name": tenant.name if tenant else "Bienestar APP B2B",
        "kpis": {
            "active_clients": active_clients,
            "videos_pending_review": 0,
            "retention_rate": 100 if active_clients > 0 else 0,
            "monthly_revenue": active_clients * 100
        },
        "revenue": {
            "mrr": active_clients * 4500,
            "growth_rate": 0
        }
    }

@router.get("/triage")
async def get_dashboard_triage(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get lightweight DTO for Clinical Triage.
    Avoids fetching full extra_data for performance.
    """
    # 1. Athletes/Clients should never receive coach triage
    if current_user.role in ["CLIENT_FITNESS", "ATHLETE", "PATIENT"]:
        return {"items": []}

    tenant_id = current_user.tenant_id
    
    # 2. Comunidad Bienestar is the global unassigned B2C pool, not a coach roster
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = tenant_res.scalars().first()
    if tenant and tenant.slug == "comunidad-bienestar":
        return {"items": []}

    # 3. Filter only legitimate clients of this specific coach tenant
    result = await db.execute(
        select(Client.id, Client.first_name, Client.last_name, Client.extra_data)
        .where(
            Client.tenant_id == tenant_id,
            ~Client.email.like("test_%"),
            ~Client.email.like("atleta_libre_%")
        )
        .order_by(Client.created_at.desc())
        .limit(100)
    )
    clients_data = result.all()
    
    triage_list = []
    for row in clients_data:
        client_id, first_name, last_name, extra_data = row
        extra = extra_data or {}
        medical_tags = extra.get("medical_tags", [])
        goal_tags = extra.get("goal_tags", [])
        
        # Calculate Risk Level
        risk_level = "GREEN"
        critical_tags = []
        
        # Burnout, TDAH, Pain are red flags
        red_flags = ["Burnout (SNC Fatigue)", "TDAH / Neurodivergente", "Transición Hormonal", "Dolor Agudo", "Amnesia Glútea", "Intolerancia a la Flexión Lumbar", "Intolerancia a la Carga Axial"]
        orange_flags = ["Weekend Warrior", "Atleta MRV", "Deficiencia en Cadena Posterior"]
        
        for tag in medical_tags + goal_tags:
            if tag in red_flags:
                risk_level = "RED"
                critical_tags.append(tag)
            elif tag in orange_flags and risk_level != "RED":
                risk_level = "ORANGE"
                critical_tags.append(tag)
        
        triage_list.append({
            "client_id": str(client_id),
            "name": f"{first_name} {last_name}",
            "risk_level": risk_level,
            "critical_tags": list(set(critical_tags))
        })
        
    return {"items": triage_list}


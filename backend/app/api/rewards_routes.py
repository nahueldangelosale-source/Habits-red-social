from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.schemas.monetization import (
    StandardResponse, 
    ResponseMeta, 
    RewardsCatalogPayload,
    RewardItem
)

router = APIRouter(prefix="/rewards", tags=["Monetization"])

@router.get("/catalog", response_model=StandardResponse[RewardsCatalogPayload])
async def get_rewards_catalog(
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    tenant_id = current_user.tenant_id
    features = getattr(current_user, "features", {}) 
    is_chaos_tenant = str(tenant_id) == "CHAOS_001"
    
    if is_chaos_tenant or features.get("ENABLE_REAL_LEDGER"):
        pass

    response.headers["X-Ecosystem-Degraded"] = "true"
    
    mock_payload = RewardsCatalogPayload(
        tenant_vp_balance=12500,
        available_rewards=[
            RewardItem(
                id="rew_001",
                name="Suscripción Premium 1 Mes",
                description="Un mes gratis de A.U.R.A. Premium",
                vital_points_cost=5000,
                available_stock=999
            ),
            RewardItem(
                id="rew_002",
                name="Consulta Nutricional 1:1",
                description="Sesión de 45 min con nutricionista clínico",
                vital_points_cost=10000,
                available_stock=5
            )
        ]
    )
    
    return StandardResponse(
        data=mock_payload,
        meta=ResponseMeta(
            is_degraded=True, 
            reason="Pending VP Ledger integration",
            ttl=3600
        )
    )

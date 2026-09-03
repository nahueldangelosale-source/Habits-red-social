from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.schemas.monetization import (
    StandardResponse, 
    ResponseMeta, 
    BusinessMetricsPayload
)

router = APIRouter(prefix="/business", tags=["Monetization"])

@router.get("/metrics", response_model=StandardResponse[BusinessMetricsPayload])
async def get_business_metrics(
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    # Tenant context from JWT TokenData
    tenant_id = current_user.tenant_id
    
    # Check Canary Routing
    # Here we simulate the tenant features. In a real scenario, this comes from token claims or Redis cache
    # to maintain O(1) performance as per CTO's performance guardrail.
    features = getattr(current_user, "features", {}) 
    is_chaos_tenant = str(tenant_id) == "CHAOS_001"
    
    if is_chaos_tenant or features.get("ENABLE_REAL_LEDGER"):
        # TODO: Fase 52/53 real logic here
        # Return real data for now we still mock just the else branch
        pass

    # Inject Degradation Header SRE Multiplier
    response.headers["X-Ecosystem-Degraded"] = "true"
    
    mock_payload = BusinessMetricsPayload(
        total_revenue_cents=15400000, # 154,000.00 ARS
        active_subscriptions=142,
        capital_at_risk_cents=450000, # 4,500.00 ARS
        mrr_growth_percentage=12.4,
        churn_rate_percentage=2.1
    )
    
    return StandardResponse(
        data=mock_payload,
        meta=ResponseMeta(
            is_degraded=True, 
            reason="Pending SQL Escrow Clearing integration (Phase 53)",
            ttl=3600
        )
    )

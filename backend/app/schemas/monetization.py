from pydantic import BaseModel, Field
from typing import Generic, TypeVar, List, Optional
import datetime

T = TypeVar('T')

class ResponseMeta(BaseModel):
    is_degraded: bool = Field(default=False, description="Indica si el payload es estático/degradado")
    ttl: int = Field(default=3600, description="Time-To-Live sugerido para la caché local")
    reason: Optional[str] = Field(default=None, description="Razón de la degradación")

class StandardResponse(BaseModel, Generic[T]):
    data: T
    meta: ResponseMeta

# ==========================================
# Tier 2: Business Metrics Payload
# ==========================================
class BusinessMetricsPayload(BaseModel):
    total_revenue_cents: int = Field(..., description="Total facturado en centavos para precisión financiera (BIGINT)")
    active_subscriptions: int
    capital_at_risk_cents: int
    mrr_growth_percentage: float
    churn_rate_percentage: float

# ==========================================
# Tier 2: Rewards Catalog Payload
# ==========================================
class RewardItem(BaseModel):
    id: str
    name: str
    description: str
    vital_points_cost: int
    available_stock: int
    image_url: Optional[str] = None

class RewardsCatalogPayload(BaseModel):
    available_rewards: List[RewardItem]
    tenant_vp_balance: int = Field(..., description="Balance actual de Vital Points del Tenant")

# ==========================================
# Tier 2: Checkout Preference Payload
# ==========================================
class CheckoutPreferenceRequest(BaseModel):
    plan_id: str
    athlete_id: str
    success_url: Optional[str] = None

class CheckoutPreferencePayload(BaseModel):
    preference_id: str = Field(..., description="ID de preferencia generado por MercadoPago u otro gateway")
    amount_cents: int
    currency: str = "ARS"
    status: str
    init_point: str = Field(..., description="URL para redirigir al checkout")

"""
Revenue Guard Service - "El Guardián de Ingresos"
Module D: Sistema de Fair Use y facturación con Stripe

Workflow:
1. Cada tenant tiene límites de uso (AI messages, imports, etc.)
2. Contadores trackean uso en tiempo real
3. Al exceder límite: degradar a templates estáticos (no bloquear)
4. Opción de "Booster Pack" para comprar más uso
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.config import get_settings
# from app.db.models import Tenant, Client, PaymentStatus, PlanTier # (Circular import avoidance - pass models as args or use local import)

settings = get_settings()


# =============================================================================
# ENUMS Y MODELOS
# =============================================================================

class PlanTier(str, Enum):
    """Nivel de plan del tenant."""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class UsageType(str, Enum):
    """Tipos de uso medible."""
    AI_MESSAGES = "ai_messages"         # Mensajes generados por AI
    VOICE_TRANSCRIPTIONS = "voice_transcriptions"  # Transcripciones de audio
    MAGIC_IMPORTS = "magic_imports"     # Importaciones con Vision
    WHATSAPP_RESPONSES = "whatsapp_responses"  # Respuestas automatizadas


class ServiceMode(str, Enum):
    """Modo de servicio actual."""
    FULL_AI = "full_ai"           # Todas las funciones AI activas
    DEGRADED = "degraded"         # Templates estáticos, AI limitado
    BLOCKED = "blocked"           # Solo lectura (impago)


class PlanLimits(BaseModel):
    """Límites por plan."""
    ai_messages_monthly: int
    voice_transcriptions_monthly: int
    magic_imports_monthly: int
    whatsapp_responses_monthly: int
    professionals_max: int
    clients_max: int


class UsageCounter(BaseModel):
    """Contador de uso actual."""
    tenant_id: UUID
    usage_type: UsageType
    current_count: int = 0
    limit: int
    period_start: datetime
    period_end: datetime
    is_exceeded: bool = False


class TenantUsageSummary(BaseModel):
    """Resumen de uso del tenant."""
    tenant_id: UUID
    plan: PlanTier
    service_mode: ServiceMode
    billing_period_start: datetime
    billing_period_end: datetime
    usage: dict[UsageType, dict] = Field(default_factory=dict)
    total_usage_percentage: float
    warnings: list[str] = Field(default_factory=list)
    can_use_ai: bool = True
    booster_available: bool = False


class BoosterPack(BaseModel):
    """Pack de uso adicional."""
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    usage_type: UsageType
    amount: int
    price_cents: int
    currency: str = "usd"
    stripe_price_id: Optional[str] = None


class PaymentEvent(BaseModel):
    """Evento de pago procesado."""
    id: UUID = Field(default_factory=uuid4)
    tenant_id: UUID
    event_type: str  # "subscription_created", "invoice_paid", etc.
    amount_cents: int
    currency: str
    stripe_event_id: str
    processed_at: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# PLAN DEFINITIONS
# =============================================================================

PLAN_LIMITS: dict[PlanTier, PlanLimits] = {
    PlanTier.FREE: PlanLimits(
        ai_messages_monthly=50,
        voice_transcriptions_monthly=5,
        magic_imports_monthly=3,
        whatsapp_responses_monthly=100,
        professionals_max=1,
        clients_max=10,
    ),
    PlanTier.STARTER: PlanLimits(
        ai_messages_monthly=500,
        voice_transcriptions_monthly=50,
        magic_imports_monthly=20,
        whatsapp_responses_monthly=1000,
        professionals_max=3,
        clients_max=50,
    ),
    PlanTier.PROFESSIONAL: PlanLimits(
        ai_messages_monthly=2000,
        voice_transcriptions_monthly=200,
        magic_imports_monthly=100,
        whatsapp_responses_monthly=5000,
        professionals_max=10,
        clients_max=500,
    ),
    PlanTier.ENTERPRISE: PlanLimits(
        ai_messages_monthly=999999,  # Unlimited
        voice_transcriptions_monthly=999999,
        magic_imports_monthly=999999,
        whatsapp_responses_monthly=999999,
        professionals_max=999999,
        clients_max=999999,
    ),
}

BOOSTER_PACKS: list[BoosterPack] = [
    BoosterPack(
        name="AI Messages x100",
        description="100 mensajes AI adicionales",
        usage_type=UsageType.AI_MESSAGES,
        amount=100,
        price_cents=499,
    ),
    BoosterPack(
        name="Voice Pack x20",
        description="20 transcripciones de voz adicionales",
        usage_type=UsageType.VOICE_TRANSCRIPTIONS,
        amount=20,
        price_cents=999,
    ),
    BoosterPack(
        name="Import Pack x10",
        description="10 importaciones mágicas adicionales",
        usage_type=UsageType.MAGIC_IMPORTS,
        amount=10,
        price_cents=499,
    ),
]


# =============================================================================
# SERVICE
# =============================================================================

class RevenueGuardService:
    """
    Servicio de control de uso y facturación.
    Implementa Fair Use Policy: degradar, no bloquear.
    
    All usage counters are stored in Redis for horizontal scaling.
    Key schema:
      - rg:usage:{tenant_id}:{usage_type}:{YYYY-MM} → int (TTL: 35 days)
      - rg:plan:{tenant_id} → string plan tier
    """
    
    # TTL for usage counters: 35 days (covers a full billing period + buffer)
    USAGE_TTL_SECONDS = 35 * 86400
    
    def __init__(self):
        self.stripe_key = settings.stripe_secret_key
    
    def _get_period_key(self) -> str:
        """Genera key para el período actual (mes)."""
        now = datetime.utcnow()
        return f"{now.year}-{now.month:02d}"
    
    def _get_usage_key(self, tenant_id: UUID, usage_type: UsageType) -> str:
        """Genera key de uso específica."""
        period = self._get_period_key()
        return f"{tenant_id}:{usage_type.value}:{period}"
    
    async def get_tenant_plan(self, tenant_id: UUID) -> PlanTier:
        """Obtiene plan del tenant desde Redis."""
        from app.services.redis_client import get_redis
        redis = await get_redis()
        plan_key = f"rg:plan:{tenant_id}"
        plan_val = await redis.get(plan_key)
        if plan_val:
            try:
                return PlanTier(plan_val)
            except ValueError:
                pass
        return PlanTier.FREE
    
    async def deduct_compute_units(
        self,
        tenant_id: UUID,
        prompt_tokens: int,
        completion_tokens: int,
        model_name: str
    ) -> int:
        """
        Deduce los tokens atómicamente en DB y sincroniza a Redis.
        Calcula unidades basado en un multiplicador del modelo.
        """
        import structlog
        from sqlalchemy import update
        from app.db.connection import async_session_maker
        from app.db.models import Tenant
        
        logger = structlog.get_logger()
        
        # Multiplica los tokens según el peso del modelo (Gemini vs Claude)
        model_multipliers = {
            "gemini-3.1-pro": (1, 3),    # 1 unit per prompt, 3 per completion
            "claude-3-opus": (5, 15),    # Expensive
            "gpt-4o-vision": (3, 10),
            "default": (1, 2)
        }
        
        p_mult, c_mult = model_multipliers.get(model_name, model_multipliers["default"])
        total_units = (prompt_tokens * p_mult) + (completion_tokens * c_mult)
        
        try:
            async with async_session_maker() as session:
                # UPDATE Atómico 
                stmt = (
                    update(Tenant)
                    .where(Tenant.id == tenant_id)
                    .where(Tenant.compute_units_balance >= total_units)
                    .values(compute_units_balance=Tenant.compute_units_balance - total_units)
                    .returning(Tenant.compute_units_balance)
                )
                result = await session.execute(stmt)
                new_balance = result.scalar_one_or_none()
                
                if new_balance is None:
                    # O falló la condición (sin saldo suficiente) o no existe tenant
                    raise ValueError(f"Insufficient funds or tenant not found to deduct {total_units} units")
                    
                await session.commit()
                
                # Sincronizar el nuevo balance en Redis
                from app.services.redis_client import get_redis
                try:
                    redis = await get_redis()
                    balance_key = f"rg:balance:{tenant_id}"
                    await redis.setex(balance_key, 3600, new_balance)
                except Exception as e:
                    logger.error("redis_sync_failed_after_deduction", error=str(e))
                
                logger.info("compute_units_deducted", 
                            tenant_id=str(tenant_id), 
                            deducted=total_units, 
                            new_balance=new_balance)
                            
                return new_balance
                
        except Exception as e:
            logger.error("deduct_compute_units_error", error=str(e))
            raise
    
    async def get_current_usage(
        self, 
        tenant_id: UUID, 
        usage_type: UsageType
    ) -> int:
        """Obtiene uso actual del período desde Redis."""
        from app.services.redis_client import get_redis
        redis = await get_redis()
        key = self._get_usage_key(tenant_id, usage_type)
        val = await redis.get(key)
        return int(val) if val else 0
    
    async def increment_usage(
        self, 
        tenant_id: UUID, 
        usage_type: UsageType,
        amount: int = 1
    ) -> UsageCounter:
        """
        Incrementa contador de uso en Redis.
        Retorna el estado actualizado del contador.
        """
        from app.services.redis_client import get_redis
        redis = await get_redis()
        key = self._get_usage_key(tenant_id, usage_type)
        plan = await self.get_tenant_plan(tenant_id)
        limits = self.get_plan_limits(plan)
        
        # Obtener límite para este tipo
        limit_map = {
            UsageType.AI_MESSAGES: limits.ai_messages_monthly,
            UsageType.VOICE_TRANSCRIPTIONS: limits.voice_transcriptions_monthly,
            UsageType.MAGIC_IMPORTS: limits.magic_imports_monthly,
            UsageType.WHATSAPP_RESPONSES: limits.whatsapp_responses_monthly,
        }
        limit = limit_map.get(usage_type, 0)
        
        # Atomic increment in Redis
        new_count = await redis.incrby(key, amount)
        # Set TTL only on first increment (when count == amount)
        if new_count == amount:
            await redis.expire(key, self.USAGE_TTL_SECONDS)
        
        # Calcular período
        now = datetime.utcnow()
        period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 12:
            period_end = period_start.replace(year=now.year + 1, month=1)
        else:
            period_end = period_start.replace(month=now.month + 1)
        
        return UsageCounter(
            tenant_id=tenant_id,
            usage_type=usage_type,
            current_count=new_count,
            limit=limit,
            period_start=period_start,
            period_end=period_end,
            is_exceeded=new_count >= limit,
        )
    
    async def check_can_use(
        self, 
        tenant_id: UUID, 
        usage_type: UsageType
    ) -> tuple[bool, ServiceMode, str]:
        """
        Verifica si el tenant puede usar un servicio.
        
        Returns:
            Tuple de (puede_usar, modo_servicio, mensaje)
        """
        plan = await self.get_tenant_plan(tenant_id)
        limits = self.get_plan_limits(plan)
        current = await self.get_current_usage(tenant_id, usage_type)
        
        limit_map = {
            UsageType.AI_MESSAGES: limits.ai_messages_monthly,
            UsageType.VOICE_TRANSCRIPTIONS: limits.voice_transcriptions_monthly,
            UsageType.MAGIC_IMPORTS: limits.magic_imports_monthly,
            UsageType.WHATSAPP_RESPONSES: limits.whatsapp_responses_monthly,
        }
        limit = limit_map.get(usage_type, 0)
        
        # Lógica Fair Use: degradar, no bloquear
        if current >= limit:
            return (
                False,
                ServiceMode.DEGRADED,
                f"Límite alcanzado ({current}/{limit}). "
                f"Usando templates estáticos. Considera un Booster Pack."
            )
        elif current >= limit * 0.8:
            return (
                True,
                ServiceMode.FULL_AI,
                f"¡Atención! Uso al {(current/limit)*100:.0f}% ({current}/{limit})"
            )
        else:
            return (
                True,
                ServiceMode.FULL_AI,
                f"Uso: {current}/{limit}"
            )
    
    async def get_usage_summary(self, tenant_id: UUID) -> TenantUsageSummary:
        """Obtiene resumen completo de uso del tenant."""
        plan = await self.get_tenant_plan(tenant_id)
        limits = self.get_plan_limits(plan)
        
        now = datetime.utcnow()
        period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 12:
            period_end = period_start.replace(year=now.year + 1, month=1)
        else:
            period_end = period_start.replace(month=now.month + 1)
        
        usage = {}
        total_used = 0
        total_limit = 0
        warnings = []
        can_use_ai = True
        
        for usage_type in UsageType:
            current = await self.get_current_usage(tenant_id, usage_type)
            limit_map = {
                UsageType.AI_MESSAGES: limits.ai_messages_monthly,
                UsageType.VOICE_TRANSCRIPTIONS: limits.voice_transcriptions_monthly,
                UsageType.MAGIC_IMPORTS: limits.magic_imports_monthly,
                UsageType.WHATSAPP_RESPONSES: limits.whatsapp_responses_monthly,
            }
            limit = limit_map.get(usage_type, 0)
            
            percentage = (current / limit * 100) if limit > 0 else 0
            usage[usage_type] = {
                "current": current,
                "limit": limit,
                "percentage": percentage,
                "exceeded": current >= limit,
            }
            
            total_used += current
            total_limit += limit
            
            if current >= limit:
                warnings.append(f"{usage_type.value}: Límite alcanzado")
                if usage_type == UsageType.AI_MESSAGES:
                    can_use_ai = False
            elif percentage >= 80:
                warnings.append(f"{usage_type.value}: {percentage:.0f}% usado")
        
        total_percentage = (total_used / total_limit * 100) if total_limit > 0 else 0
        
        return TenantUsageSummary(
            tenant_id=tenant_id,
            plan=plan,
            service_mode=ServiceMode.FULL_AI if can_use_ai else ServiceMode.DEGRADED,
            billing_period_start=period_start,
            billing_period_end=period_end,
            usage=usage,
            total_usage_percentage=total_percentage,
            warnings=warnings,
            can_use_ai=can_use_ai,
            booster_available=True,
        )
    
    def get_booster_packs(self) -> list[BoosterPack]:
        """Obtiene lista de booster packs disponibles."""
        return BOOSTER_PACKS
    
    def apply_booster(
        self, 
        tenant_id: UUID, 
        booster: BoosterPack
    ) -> str:
        """
        Aplica un booster pack (mock - requiere Stripe en producción).
        """
        # En producción: verificar pago con Stripe, luego actualizar límites
        return f"Booster '{booster.name}' aplicado. +{booster.amount} {booster.usage_type.value}"

    # =========================================================================
    # HYBRID REVENUE ENGINE (Mercado Pago Split + Access Control)
    # =========================================================================

    async def generate_split_preference(
        self, 
        pro_tenant, # Type: Tenant
        client_data: dict
    ) -> dict:
        """
        Genera preferencia de pago con Split (Marketplace Fee).
        El Pro recibe (Precio - Fee) y la Plataforma recibe Fee.
        """
        if not pro_tenant.mp_access_token:
            raise ValueError("El profesional no ha conectado su cuenta de Mercado Pago")

        price = pro_tenant.subscription_price
        if price <= 0:
            raise ValueError("El precio de suscripción no es válido")

        # Calcular split (Ej: 10% fee)
        PLATFORM_FEE_PCT = 0.10
        marketplace_fee = price * PLATFORM_FEE_PCT
        
        # En producción: Usar SDK de Mercado Pago
        # import mercadopago
        # sdk = mercadopago.SDK(settings.mp_access_token)
        # preference_data = { ... }
        
        # Mock Response
        return {
            "id": f"pref_{uuid4().hex[:8]}",
            "init_point": f"https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock",
            "marketplace_fee": marketplace_fee,
            "pro_amount": price - marketplace_fee,
            "currency": pro_tenant.currency
        }

    async def check_access(self, client) -> bool: # Type: Client
        """
        Verifica si el cliente tiene acceso al servicio.
        
        Reglas:
        1. MANUAL_OVERRIDE: Acceso garantizado por el Pro (Cobro efectivo).
        2. ACTIVE: Pago al día.
        3. TRIAL: Periodo de prueba vigente.
        4. Expiración: Si tiene fecha de vencimiento, validarla.
        """
        # Status-based access
        if str(client.payment_status) == "manual": # PaymentStatus.MANUAL_OVERRIDE
            return True
            
        if str(client.payment_status) == "active": # PaymentStatus.ACTIVE
            # Check expiration if set
            if client.access_expires_at:
                return client.access_expires_at > datetime.utcnow()
            return True
            
        if str(client.payment_status) == "trial":
             if client.access_expires_at:
                return client.access_expires_at > datetime.utcnow()
             return False # Trial requires expiration date

        return False # PAST_DUE or others

    def assign_ai_coach(self, client_id: UUID) -> dict:
        """
        Asigna el 'Entrenador Virtual' (B2C) a un usuario huérfano.
        """
        # Logic: Set is_ai_only=True
        # In DB update: client.is_ai_only = True
        return {
            "status": "assigned",
            "mode": "ai_coach",
            "features_enabled": ["workout_builder", "voice_to_chart"]
        }


# Singleton
revenue_guard_service = RevenueGuardService()

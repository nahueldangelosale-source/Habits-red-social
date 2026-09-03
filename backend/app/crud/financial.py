from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.models import FinancialLedger

async def get_tenant_ledger_balance(db: AsyncSession, tenant_id: str) -> int:
    """
    Obtiene el balance total del ledger financiero para un tenant específico.
    El tenant_id es un parámetro posicional obligatorio para garantizar el Tenant Isolation.
    """
    # Si falta el tenant_id, el linter y Python fallan, actuando como escudo protector.
    stmt = select(func.coalesce(func.sum(FinancialLedger.amount_cents), 0)).where(
        FinancialLedger.tenant_id == tenant_id
    )
    result = await db.execute(stmt)
    return result.scalar_one()

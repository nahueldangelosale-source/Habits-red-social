from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
import uuid

from app.db.database import get_db
from app.db.rbac import User, Role
from app.middleware.auth import get_current_user
from app.domain.billing.models import LedgerEntry
from app.services.redis_client import redis_client

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/professionals", tags=["Payouts"])

class PayoutRequest(BaseModel):
    amount_cents: int

@router.get("/balance")
async def get_balance(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] not in [Role.PERSONAL_TRAINER.value, Role.NUTRITIONIST.value, Role.ADMIN.value]:
        raise HTTPException(status_code=403, detail="Not a professional")

    tenant_id = current_user["tenant_id"]
    user_id = current_user["id"]
    cache_key = f"tenant:{tenant_id}:prof:{user_id}:balance"

    # 1. Try Redis O(1) Cache
    cached_balance = await redis_client.hget(cache_key, "available_cents")
    
    if cached_balance is not None:
        return {"available_cents": int(cached_balance)}

    # 2. Fallback to Postgres Aggregation
    sum_stmt = select(func.sum(LedgerEntry.amount_cents)).where(
        LedgerEntry.user_id == uuid.UUID(user_id)
    )
    res = await db.execute(sum_stmt)
    total_cents = res.scalar_one_or_none() or 0

    # 3. Repopulate Cache
    await redis_client.hset(cache_key, "available_cents", total_cents)
    
    return {"available_cents": total_cents}

@router.post("/payouts", status_code=status.HTTP_202_ACCEPTED)
async def request_payout(
    payload: PayoutRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] not in [Role.PERSONAL_TRAINER.value, Role.NUTRITIONIST.value, Role.ADMIN.value]:
        raise HTTPException(status_code=403, detail="Not a professional")
        
    amount_cents = payload.amount_cents
    
    # Validation: Minimum Payout Threshold (5,000 ARS)
    if amount_cents < 500000:
        logger.warning("payout_rejected_minimum_threshold", user_id=current_user["id"], amount_cents=amount_cents)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Minimum payout is 5,000 ARS."
        )

    tenant_id = current_user["tenant_id"]
    user_id_uuid = uuid.UUID(current_user["id"])
    
    try:
        # 1. Pessimistic Lock on User to prevent concurrent payouts
        user_stmt = select(User).where(User.id == user_id_uuid).with_for_update()
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # 2. Authoritative Postgres Balance Check
        sum_stmt = select(func.sum(LedgerEntry.amount_cents)).where(
            LedgerEntry.user_id == user_id_uuid
        )
        res = await db.execute(sum_stmt)
        total_cents = res.scalar_one_or_none() or 0
        
        if total_cents < amount_cents:
            logger.warning("payout_rejected_insufficient_funds", user_id=current_user["id"], requested=amount_cents, balance=total_cents)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds for payout."
            )
            
        # 3. Insert Append-Only Compensating Entry
        payout_id = uuid.uuid4()
        payout_entry = LedgerEntry(
            tenant_id=uuid.UUID(tenant_id),
            user_id=user_id_uuid,
            amount_cents=-amount_cents,  # Negative entry
            currency="ARS",
            reference_type="PAYOUT_REQUEST",
            reference_id=payout_id
        )
        db.add(payout_entry)
        
        # 4. Atomic Commit
        await db.commit()
        
        # 5. Update Redis Write-Through Cache
        cache_key = f"tenant:{tenant_id}:prof:{current_user['id']}:balance"
        await redis_client.hincrby(cache_key, "available_cents", -amount_cents)
        
        logger.info(
            "payout_requested_success", 
            user_id=current_user["id"], 
            tenant_id=tenant_id, 
            amount_cents=amount_cents, 
            payout_id=str(payout_id),
            remaining_cents=(total_cents - amount_cents)
        )
        
        return {
            "status": "PENDING_LIQUIDATION",
            "message": "Payout requested successfully.",
            "deducted_cents": amount_cents,
            "remaining_cents": total_cents - amount_cents
        }
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

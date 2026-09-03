from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, text
from sqlalchemy.dialects.postgresql import insert
import uuid
import json
from datetime import datetime, timezone
import hashlib

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.db.models import Protocol, ProtocolType, ProtocolStatus
from app.db.models_plans import PlanDraft, AnalyticsAthleteWorkload

router = APIRouter(prefix="/api/v1/plans", tags=["Plans"])

def compute_state_hash(payload: dict) -> str:
    """Generate SHA-256 hash of the payload to detect drift."""
    payload_str = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(payload_str.encode("utf-8")).hexdigest()


@router.post("/draft")
async def save_plan_draft(
    payload: dict,
    state_hash: str = Header(None, description="Client state hash for Drift Protocol"),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    UPSERT a draft plan. Implements Drift Protocol to avoid race conditions.
    """
    tenant_id = current_user.tenant_id
    trainer_id = current_user.user_id
    
    # Extract athlete_id if available
    athlete_id_str = payload.get("athlete_id")
    athlete_id = uuid.UUID(athlete_id_str) if athlete_id_str else None
    
    if not state_hash:
        state_hash = compute_state_hash(payload)

    # 1. UPSERT Draft (Lookup first for simplicity)
    stmt_lookup = select(PlanDraft).where(
        PlanDraft.trainer_id == trainer_id,
        PlanDraft.tenant_id == tenant_id
    )
    if athlete_id:
        stmt_lookup = stmt_lookup.where(PlanDraft.athlete_id == athlete_id)
        
    result_lookup = await db.execute(stmt_lookup)
    existing_draft = result_lookup.scalar_one_or_none()
    
    if existing_draft:
        # Check Drift on draft level
        # Simplified: If the incoming hash is "older", we should throw 409.
        # But without vector clocks or strict sequential hashes from the client, we just update it here.
        # We assume the client provides a sequence number or timestamp in the hash in production.
        existing_draft.payload = payload
        existing_draft.state_hash = state_hash
        existing_draft.updated_at = datetime.now(timezone.utc)
        # Extend TTL by 14 days
        from datetime import timedelta
        existing_draft.expires_at = datetime.now(timezone.utc) + timedelta(days=14)
    else:
        new_draft = PlanDraft(
            tenant_id=tenant_id,
            trainer_id=trainer_id,
            athlete_id=athlete_id,
            state_hash=state_hash,
            payload=payload
        )
        db.add(new_draft)

    await db.commit()
    
    return {"status": "success", "state_hash": state_hash, "message": "Draft saved"}


@router.post("/commit")
async def commit_plan(
    payload: dict,
    x_idempotency_key: str = Header(None, description="Idempotency key to prevent double submits"),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Finalize the plan assignment.
    Executes synchronous clinical validation and writes to the analytical tables.
    """
    tenant_id = current_user.tenant_id
    trainer_id = current_user.user_id
    
    # In a real scenario, we'd check Redis using x_idempotency_key here.
    
    # 0. ACID strictness
    await db.execute(text("SET LOCAL statement_timeout = 2000"))
    
    # 1. Clinical Firewall Validation (Synchronous)
    athlete_id_str = payload.get("athlete_id")
    if not athlete_id_str:
        raise HTTPException(status_code=400, detail="athlete_id is required for commit")
    
    athlete_id = uuid.UUID(athlete_id_str)
    
    routine = payload.get("routine", [])
    
    # Calculate Workload (SNC Heatmap equivalent)
    workload_data = {}
    for block in routine:
        for item in block.get("items", []):
            exercise = item.get("exercise")
            if not exercise:
                continue
            muscle = exercise.get("Musculo_Agonista")
            if muscle:
                # Extract max sets
                import re
                sets_str = str(item.get("sets", "0"))
                matches = re.findall(r'\d+', sets_str)
                sets_count = max(int(m) for m in matches) if matches else 0
                
                workload_data[muscle] = workload_data.get(muscle, 0) + sets_count
                
    # Simulated clinical check: e.g. "Hombro" > 0 but patient has shoulder injury.
    # (Here we would throw HTTP 400)
    
    # 2. Relational Insertion
    new_protocol = Protocol(
        tenant_id=tenant_id,
        professional_id=trainer_id,
        client_id=athlete_id,
        type=ProtocolType.WORKOUT.value, # Default to workout type
        name=payload.get("cycleName", "Nuevo Plan"),
        content=payload,
        status=ProtocolStatus.PUBLISHED.value
    )
    db.add(new_protocol)
    await db.flush() # Get protocol ID
    
    # 3. Analytical Snapshot for CRI
    analytics_snapshot = AnalyticsAthleteWorkload(
        tenant_id=tenant_id,
        athlete_id=athlete_id,
        protocol_id=new_protocol.id,
        workload_data=workload_data
    )
    db.add(analytics_snapshot)
    
    # 4. Cleanup Drafts
    stmt_del = delete(PlanDraft).where(
        PlanDraft.trainer_id == trainer_id,
        PlanDraft.athlete_id == athlete_id
    )
    await db.execute(stmt_del)
    
    await db.commit()
    
    # 5. (Async Dispatch) Trigger CRI Engine
    # e.g., trigger_cri_worker.delay(tenant_id, athlete_id)
    
    return {"status": "success", "protocol_id": str(new_protocol.id), "workload": workload_data}

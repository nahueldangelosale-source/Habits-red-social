from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Dict, Any
from app.db.connection import get_db
from app.middleware.auth import get_current_user, TokenData
import json
import hashlib

router = APIRouter()

@router.get("/conflicts", response_model=Dict[str, Any])
async def get_all_conflicts(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtiene todos los planes activos en estado CONFLICT_PENDING para el tenant del coach actual.
    Sync-on-Wakeup API.
    """
    query = text("""
        SELECT awp.client_id, awp.origin_protocol_id, awp.status
        FROM active_workout_plans awp
        WHERE awp.tenant_id = :tenant_id AND awp.status = 'CONFLICT_PENDING'
    """)
    result = await db.execute(query, {"tenant_id": current_user.tenant_id})
    conflicts = [{"client_id": str(row[0]), "origin_protocol_id": str(row[1]), "status": row[2]} for row in result.fetchall()]
    
    return {"status": "SUCCESS", "conflicts": conflicts}

@router.get("/conflicts/{client_id}", response_model=Dict[str, Any])
async def get_conflict_details(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Retorna el ActiveWorkoutPlan en conflicto y el Protocol original.
    """
    query = text("""
        SELECT awp.content as active_content, p.content as protocol_content, awp.status, awp.origin_protocol_id
        FROM active_workout_plans awp
        JOIN protocols p ON awp.origin_protocol_id = p.id
        WHERE awp.client_id = :client_id AND awp.tenant_id = :tenant_id
    """)
    result = await db.execute(query, {"client_id": client_id, "tenant_id": current_user.tenant_id})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Conflict not found for this client")
        
    return {
        "status": "SUCCESS",
        "active_plan": row[0],
        "origin_protocol": row[1],
        "plan_status": row[2],
        "origin_protocol_id": str(row[3])
    }

@router.post("/conflicts/{client_id}/resolve", response_model=Dict[str, Any])
async def resolve_conflict(
    client_id: str,
    action: str, # "KEEP_ADAPTATION" or "OVERWRITE"
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Resuelve el conflicto de manera idempotente.
    """
    if action not in ["KEEP_ADAPTATION", "OVERWRITE"]:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    # Verificar estado actual (Idempotencia)
    check_query = text("""
        SELECT awp.status, awp.origin_protocol_id, p.content as protocol_content
        FROM active_workout_plans awp
        JOIN protocols p ON awp.origin_protocol_id = p.id
        WHERE awp.client_id = :client_id AND awp.tenant_id = :tenant_id
    """)
    result = await db.execute(check_query, {"client_id": client_id, "tenant_id": current_user.tenant_id})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Active plan not found")
        
    current_status, protocol_id, protocol_content = row
    
    # Idempotency check: If it's already resolved, just return 200 OK silently
    if current_status != "CONFLICT_PENDING":
        return {"status": "SUCCESS", "message": "Conflict already resolved", "action_taken": "NONE (Idempotent)"}
        
    if action == "KEEP_ADAPTATION":
        # Calculate origin protocol hash and set it to awp, clean CONFLICT_PENDING
        content_str = json.dumps(protocol_content, sort_keys=True)
        new_state_hash = hashlib.sha256(content_str.encode('utf-8')).hexdigest()
        
        update_query = text("""
            UPDATE active_workout_plans
            SET status = 'ACTIVE', state_hash = :new_hash, updated_at = NOW()
            WHERE client_id = :client_id AND tenant_id = :tenant_id AND status = 'CONFLICT_PENDING'
        """)
        await db.execute(update_query, {"new_hash": new_state_hash, "client_id": client_id, "tenant_id": current_user.tenant_id})
        
    elif action == "OVERWRITE":
        content_str = json.dumps(protocol_content, sort_keys=True)
        new_state_hash = hashlib.sha256(content_str.encode('utf-8')).hexdigest()
        
        update_query = text("""
            UPDATE active_workout_plans
            SET status = 'ACTIVE', content = :new_content, state_hash = :new_hash, updated_at = NOW()
            WHERE client_id = :client_id AND tenant_id = :tenant_id AND status = 'CONFLICT_PENDING'
        """)
        await db.execute(update_query, {
            "new_content": json.dumps(protocol_content), 
            "new_hash": new_state_hash, 
            "client_id": client_id, 
            "tenant_id": current_user.tenant_id
        })
        
    await db.commit()
    
    return {"status": "SUCCESS", "message": f"Conflict resolved using {action}", "action_taken": action}

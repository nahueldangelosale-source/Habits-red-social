"""
WAGER ENGINE - The Arena Referee
Handles P2P betting with escrow, integrity verification, and resolution.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Tuple
import logging

try:
    from sqlalchemy.orm import Session
    from app.models.wager import (
        Wager, WagerStatus, ChallengeMetric, VerificationType,
        WagerVerification, WagerEscrow
    )
except ImportError:
    pass

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════
# INTEGRITY THRESHOLDS (Anti-Fraud)
# ═══════════════════════════════════════════════════════════════════════════

INTEGRITY_THRESHOLDS = {
    "min_hr_for_high_cal": 90,       # Minimum HR for >500 calories
    "max_steps_per_hour": 7200,      # ~120 steps/min max realistic
    "min_cadence_variance": 0.15,    # Must have some natural variance
    "max_constant_cadence_hours": 1, # Flag if perfect cadence for >1hr
}

METRIC_TARGETS = {
    ChallengeMetric.STEPS_COUNT: "steps",
    ChallengeMetric.ACTIVE_ENERGY_BURNED: "active_calories",
    ChallengeMetric.DISTANCE_KM: "distance_km",
    ChallengeMetric.WORKOUT_MINUTES: "workout_minutes",
}


# ═══════════════════════════════════════════════════════════════════════════
# WAGER LIFECYCLE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

async def create_wager(
    challenger_id: str,
    opponent_id: str,
    stake_amount: int,
    challenge_type: ChallengeMetric,
    tenant_id: str,
    db: "Session",
    challenge_description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Step 1: Create a new wager challenge.
    
    Pre-conditions:
    - Both users must be in the same tenant
    - Challenger must have >= stake_amount in wallet
    - No duplicate pending wagers between same users
    """
    
    # Validation
    if challenger_id == opponent_id:
        return {"error": "No puedes desafiarte a ti mismo"}
    
    if stake_amount < 50:
        return {"error": "La apuesta mínima es de 50 puntos"}
    
    if stake_amount > 5000:
        return {"error": "La apuesta máxima es de 5000 puntos"}
    
    # Check wallet balance (placeholder)
    challenger_balance = await get_user_wallet_balance(challenger_id, db)
    if challenger_balance < stake_amount:
        return {"error": "Puntos insuficientes", "balance": challenger_balance}
    
    # Check for existing pending wager
    existing = db.query(Wager).filter(
        Wager.challenger_id == challenger_id,
        Wager.opponent_id == opponent_id,
        Wager.status == WagerStatus.PENDING_ACCEPTANCE
    ).first()
    
    if existing:
        return {"error": "Ya tienes un desafío pendiente con este usuario"}
    
    # Determine verification type
    verification_type = get_verification_type(challenge_type)
    
    # Set time bounds (24-hour challenge starting midnight)
    now = datetime.utcnow()
    tomorrow_start = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_end = tomorrow_start + timedelta(hours=23, minutes=59, seconds=59)
    sync_deadline = tomorrow_end + timedelta(hours=12)  # Golden Hour
    
    # Create wager
    wager = Wager(
        tenant_id=tenant_id,
        challenger_id=challenger_id,
        opponent_id=opponent_id,
        stake_amount=stake_amount,
        challenge_type=challenge_type,
        verification_type=verification_type,
        challenge_start=tomorrow_start,
        challenge_end=tomorrow_end,
        sync_deadline=sync_deadline,
        challenge_description=challenge_description,
        status=WagerStatus.PENDING_ACCEPTANCE
    )
    
    db.add(wager)
    db.commit()
    
    # Send notification to opponent
    await send_wager_notification(
        opponent_id,
        "challenge_received",
        {
            "challenger_name": await get_user_name(challenger_id, db),
            "stake": stake_amount,
            "metric": challenge_type.value,
            "wager_id": wager.id
        }
    )
    
    return {
        "success": True,
        "wager_id": wager.id,
        "status": "PENDING",
        "message": f"¡Desafío enviado! Esperando a que el oponente acepte."
    }


async def accept_wager(wager_id: str, user_id: str, db: "Session") -> Dict[str, Any]:
    """
    Step 2: Opponent accepts the challenge.
    Points are locked in escrow for both parties.
    """
    
    wager = db.query(Wager).filter(Wager.id == wager_id).first()
    if not wager:
        return {"error": "Wager not found"}
    
    if wager.opponent_id != user_id:
        return {"error": "Solo el usuario desafiado puede aceptar"}
    
    if wager.status != WagerStatus.PENDING_ACCEPTANCE:
        return {"error": f"El desafío no está pendiente (actual: {wager.status.value})"}
    
    # Check opponent balance
    opponent_balance = await get_user_wallet_balance(user_id, db)
    if opponent_balance < wager.stake_amount:
        return {"error": "Puntos insuficientes", "balance": opponent_balance}
    
    # Lock points in escrow
    await lock_points_in_escrow(wager.challenger_id, wager.stake_amount, wager.id, db)
    await lock_points_in_escrow(wager.opponent_id, wager.stake_amount, wager.id, db)
    
    # Update wager
    wager.escrow_total = wager.stake_amount * 2
    wager.status = WagerStatus.ACTIVE
    wager.accepted_at = datetime.utcnow()
    
    db.commit()
    
    # Notify challenger
    await send_wager_notification(
        wager.challenger_id,
        "challenge_accepted",
        {
            "opponent_name": await get_user_name(user_id, db),
            "stake": wager.stake_amount,
            "starts": wager.challenge_start.isoformat()
        }
    )
    
    return {
        "success": True,
        "wager_id": wager_id,
        "status": "ACTIVE",
        "escrow_total": wager.escrow_total,
        "starts_at": wager.challenge_start.isoformat()
    }


async def decline_wager(wager_id: str, user_id: str, db: "Session") -> Dict[str, Any]:
    """Opponent declines the challenge."""
    
    wager = db.query(Wager).filter(Wager.id == wager_id).first()
    if not wager:
        return {"error": "Wager not found"}
    
    if wager.opponent_id != user_id:
        return {"error": "Solo el usuario desafiado puede rechazar"}
    
    if wager.status != WagerStatus.PENDING_ACCEPTANCE:
        return {"error": "El desafío no está pendiente"}
    
    wager.status = WagerStatus.CANCELLED
    db.commit()
    
    # Notify challenger
    await send_wager_notification(
        wager.challenger_id,
        "challenge_declined",
        {"opponent_name": await get_user_name(user_id, db)}
    )
    
    return {"success": True, "status": "CANCELADO"}


# ═══════════════════════════════════════════════════════════════════════════
# RESOLUTION ENGINE (The Referee)
# ═══════════════════════════════════════════════════════════════════════════

async def resolve_daily_wagers(db: "Session") -> Dict[str, Any]:
    """
    Cron job: Runs at 00:05 AM local time to resolve previous day's wagers.
    Also runs at 12:05 PM to resolve wagers waiting for sync.
    """
    
    now = datetime.utcnow()
    results = {
        "resolved": [],
        "flagged_for_review": [],
        "awaiting_sync": [],
        "errors": []
    }
    
    # Get all ACTIVE wagers that have ended
    active_wagers = db.query(Wager).filter(
        Wager.status == WagerStatus.ACTIVE,
        Wager.challenge_end < now
    ).all()
    
    for wager in active_wagers:
        try:
            result = await resolve_single_wager(wager, db)
            
            if result["status"] == "resolved":
                results["resolved"].append(result)
            elif result["status"] == "flagged":
                results["flagged_for_review"].append(result)
            elif result["status"] == "awaiting_sync":
                results["awaiting_sync"].append(result)
                
        except Exception as e:
            logger.error(f"Error resolving wager {wager.id}: {e}")
            results["errors"].append({"wager_id": wager.id, "error": str(e)})
    
    return results


async def resolve_single_wager(wager: "Wager", db: "Session") -> Dict[str, Any]:
    """
    Resolves a single wager by comparing metrics.
    """
    
    now = datetime.utcnow()
    metric_key = METRIC_TARGETS.get(wager.challenge_type, "steps")
    
    # 1. Fetch health data for both participants
    challenger_data = await fetch_health_data(
        wager.challenger_id, 
        wager.challenge_start,
        wager.challenge_end,
        metric_key,
        db
    )
    
    opponent_data = await fetch_health_data(
        wager.opponent_id,
        wager.challenge_start,
        wager.challenge_end,
        metric_key,
        db
    )
    
    # 2. Check if data is synced
    if not challenger_data.get("synced") or not opponent_data.get("synced"):
        if now < wager.sync_deadline:
            wager.status = WagerStatus.AWAITING_SYNC
            db.commit()
            return {"wager_id": wager.id, "status": "awaiting_sync"}
        else:
            # Past deadline - whoever didn't sync loses
            return await resolve_by_forfeit(wager, challenger_data, opponent_data, db)
    
    # 3. Verify integrity
    challenger_integrity = verify_data_integrity(challenger_data)
    opponent_integrity = verify_data_integrity(opponent_data)
    
    # Store verification records
    await store_verification(wager.id, wager.challenger_id, challenger_data, challenger_integrity, db)
    await store_verification(wager.id, wager.opponent_id, opponent_data, opponent_integrity, db)
    
    # 4. Check for integrity flags
    if challenger_integrity["score"] < 0.5 or opponent_integrity["score"] < 0.5:
        wager.status = WagerStatus.AWAITING_VERIFICATION
        wager.integrity_flags = (wager.integrity_flags or []) + \
            challenger_integrity.get("flags", []) + \
            opponent_integrity.get("flags", [])
        db.commit()
        
        # Notify Pro for manual review
        await notify_pro_for_review(wager, db)
        
        return {"wager_id": wager.id, "status": "flagged", "flags": wager.integrity_flags}
    
    # 5. Determine winner
    winner_id, loser_id = determine_winner(
        wager.challenger_id, challenger_data.get("value", 0),
        wager.opponent_id, opponent_data.get("value", 0)
    )
    
    # 6. Transfer escrow to winner
    await release_escrow_to_winner(wager, winner_id, db)
    
    # 7. Update wager
    wager.winner_id = winner_id
    wager.status = WagerStatus.COMPLETED
    wager.resolved_at = datetime.utcnow()
    wager.metrics_challenger = challenger_data
    wager.metrics_opponent = opponent_data
    
    db.commit()
    
    # 8. Notify participants
    await send_wager_result_notifications(wager, winner_id, loser_id, db)
    
    return {
        "wager_id": wager.id,
        "status": "resolved",
        "winner": winner_id,
        "challenger_value": challenger_data.get("value"),
        "opponent_value": opponent_data.get("value")
    }


# ═══════════════════════════════════════════════════════════════════════════
# INTEGRITY VERIFICATION (Anti-Fraud)
# ═══════════════════════════════════════════════════════════════════════════

def verify_data_integrity(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs anti-fraud checks on health data.
    Returns integrity score (0.0-1.0) and any flags.
    """
    
    score = 1.0
    flags = []
    
    source = data.get("source", "").lower()
    
    # Check 1: Must be sensor data, not manual entry
    if "manual" in source:
        score -= 0.5
        flags.append({
            "type": "MANUAL_ENTRY",
            "severity": "critical",
            "message": "Los datos fueron ingresados manualmente, no provienen de sensores"
        })
    
    # Check 2: Heart rate consistency for calorie claims
    if data.get("metric_type") == "active_calories":
        calories = data.get("value", 0)
        avg_hr = data.get("avg_heart_rate", 0)
        
        if calories > 500 and avg_hr < INTEGRITY_THRESHOLDS["min_hr_for_high_cal"]:
            score -= 0.3
            flags.append({
                "type": "LOW_HR_HIGH_CAL",
                "severity": "warning",
                "message": f"Se reclamaron {calories} calorías pero el FC promedio fue de solo {avg_hr} bpm"
            })
    
    # Check 3: Cadence consistency (dog walker detection)
    if data.get("metric_type") == "steps":
        cadence_variance = data.get("cadence_variance", 1.0)
        
        if cadence_variance < INTEGRITY_THRESHOLDS["min_cadence_variance"]:
            constant_hours = data.get("constant_cadence_hours", 0)
            
            if constant_hours > INTEGRITY_THRESHOLDS["max_constant_cadence_hours"]:
                score -= 0.4
                flags.append({
                    "type": "CONSTANT_CADENCE",
                    "severity": "suspicious",
                    "message": f"Cadencia perfecta durante {constant_hours} horas - posible agitación del dispositivo"
                })
    
    # Check 4: Superhuman speed
    if data.get("metric_type") == "steps":
        duration_hours = data.get("active_hours", 1)
        steps = data.get("value", 0)
        steps_per_hour = steps / max(duration_hours, 0.1)
        
        if steps_per_hour > INTEGRITY_THRESHOLDS["max_steps_per_hour"]:
            score -= 0.3
            flags.append({
                "type": "SUPERHUMAN_PACE",
                "severity": "warning",
                "message": f"El ritmo de {steps_per_hour:.0f} pasos/hora excede los límites humanos"
            })
    
    return {
        "score": max(score, 0.0),
        "flags": flags,
        "verified": score >= 0.5
    }


def determine_winner(
    user_a_id: str, value_a: float,
    user_b_id: str, value_b: float
) -> Tuple[Optional[str], Optional[str]]:
    """
    Determines the winner based on metric comparison.
    Returns (winner_id, loser_id) or (None, None) for ties.
    """
    
    if value_a > value_b:
        return user_a_id, user_b_id
    elif value_b > value_a:
        return user_b_id, user_a_id
    else:
        # Exact tie - rare but possible
        return None, None


# ═══════════════════════════════════════════════════════════════════════════
# ESCROW MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════

async def lock_points_in_escrow(
    user_id: str, 
    amount: int, 
    wager_id: str,
    db: "Session"
) -> None:
    """
    Deducts points from user wallet and locks them in escrow.
    """
    
    # Get current balance (placeholder)
    current_balance = await get_user_wallet_balance(user_id, db)
    
    # Create escrow record
    escrow = WagerEscrow(
        wager_id=wager_id,
        action="LOCK",
        user_id=user_id,
        amount=amount,
        balance_before=current_balance,
        balance_after=current_balance - amount
    )
    db.add(escrow)
    
    # TODO: Actually deduct from wallet
    # await deduct_wallet(user_id, amount, db)
    
    logger.info(f"Locked {amount} points from user {user_id} for wager {wager_id}")


async def release_escrow_to_winner(wager: "Wager", winner_id: str, db: "Session") -> None:
    """
    Releases all escrowed points to the winner.
    """
    
    total = wager.escrow_total
    
    # Create release record
    escrow = WagerEscrow(
        wager_id=wager.id,
        action="RELEASE_TO_WINNER",
        user_id=winner_id,
        amount=total,
        balance_before=0,  # TODO: Get actual balance
        balance_after=total
    )
    db.add(escrow)
    
    # TODO: Actually credit wallet
    # await credit_wallet(winner_id, total, db)
    
    logger.info(f"Released {total} points to winner {winner_id} for wager {wager.id}")


# ═══════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS (Placeholders - implement with your data layer)
# ═══════════════════════════════════════════════════════════════════════════

async def get_user_wallet_balance(user_id: str, db: "Session") -> int:
    """TODO: Implement actual wallet query."""
    return 5000  # Placeholder

async def get_user_name(user_id: str, db: "Session") -> str:
    """TODO: Implement actual user lookup."""
    return "Usuario"

async def send_wager_notification(user_id: str, event: str, data: Dict) -> None:
    """TODO: Implement push notification."""
    logger.info(f"Notification to {user_id}: {event} - {data}")

async def fetch_health_data(
    user_id: str, 
    start: datetime, 
    end: datetime, 
    metric: str,
    db: "Session"
) -> Dict[str, Any]:
    """TODO: Implement HealthKit/Garmin data fetch."""
    return {
        "synced": True,
        "value": 8500,
        "source": "Apple Health",
        "metric_type": metric,
        "avg_heart_rate": 95,
        "cadence_variance": 0.35
    }

async def store_verification(
    wager_id: str,
    user_id: str, 
    data: Dict,
    integrity: Dict,
    db: "Session"
) -> None:
    """Stores verification record."""
    verification = WagerVerification(
        wager_id=wager_id,
        user_id=user_id,
        source_name=data.get("source", "Unknown"),
        metric_type=data.get("metric_type", "unknown"),
        raw_value=data.get("value", 0),
        integrity_score=integrity.get("score", 1.0),
        integrity_checks=integrity
    )
    db.add(verification)

async def notify_pro_for_review(wager: "Wager", db: "Session") -> None:
    """Notifies the Pro for manual review."""
    logger.info(f"Pro review needed for wager {wager.id}")

async def send_wager_result_notifications(
    wager: "Wager", 
    winner_id: str, 
    loser_id: str,
    db: "Session"
) -> None:
    """Sends result notifications to both parties."""
    if winner_id:
        await send_wager_notification(
            winner_id,
            "wager_won",
            {"amount": wager.escrow_total}
        )
    if loser_id:
        await send_wager_notification(
            loser_id,
            "wager_lost",
            {"message": "¡Revancha mañana?"}
        )

async def resolve_by_forfeit(
    wager: "Wager",
    challenger_data: Dict,
    opponent_data: Dict,
    db: "Session"
) -> Dict[str, Any]:
    """Resolves wager when one party didn't sync data."""
    
    challenger_synced = challenger_data.get("synced", False)
    opponent_synced = opponent_data.get("synced", False)
    
    if challenger_synced and not opponent_synced:
        winner_id = wager.challenger_id
    elif opponent_synced and not challenger_synced:
        winner_id = wager.opponent_id
    else:
        # Neither synced - refund both
        wager.status = WagerStatus.CANCELLED
        # TODO: Refund escrow
        db.commit()
        return {"wager_id": wager.id, "status": "cancelled", "reason": "no_sync"}
    
    await release_escrow_to_winner(wager, winner_id, db)
    wager.winner_id = winner_id
    wager.status = WagerStatus.COMPLETED
    wager.resolved_at = datetime.utcnow()
    db.commit()
    
    return {"wager_id": wager.id, "status": "resolved", "winner": winner_id, "reason": "forfeit"}

def get_verification_type(challenge_type: ChallengeMetric) -> VerificationType:
    """Determines verification type based on challenge metric."""
    auto_verifiable = [
        ChallengeMetric.STEPS_COUNT,
        ChallengeMetric.ACTIVE_ENERGY_BURNED,
        ChallengeMetric.DISTANCE_KM,
        ChallengeMetric.WORKOUT_MINUTES
    ]
    
    if challenge_type in auto_verifiable:
        return VerificationType.AUTOMATIC
    else:
        return VerificationType.MANUAL

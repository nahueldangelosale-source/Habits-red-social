"""
AVATAR ENGINE - The Morpher
Translates real workout data into visual avatar attributes.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

# Adjust imports based on your project structure
try:
    from sqlalchemy.orm import Session
    from app.models.avatar import Avatar
except ImportError:
    pass

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════
# NORMALIZATION CONSTANTS
# These define what "god tier" (1.0) looks like for each metric
# ═══════════════════════════════════════════════════════════════════════════

NORMALIZATION = {
    "weekly_volume_kg": 10000,      # 10,000 kg/week = max muscle
    "weekly_cardio_min": 300,       # 5 hours cardio/week = max leanness
    "hydration_streak": 14,         # 14-day hydration streak = max energy
    "sleep_quality_avg": 90,        # 90% sleep quality = max energy
    "mobility_sessions": 7,         # Daily mobility = max posture
}


async def update_avatar_physique(
    user_id: str,
    db: "Session",
    weekly_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Recalculates avatar physique metrics based on real workout data.
    Called nightly by cron job or after significant activity.
    
    Args:
        user_id: The user's ID
        db: Database session
        weekly_data: Pre-fetched weekly stats (optional, will fetch if not provided)
    
    Returns:
        Updated physique metrics dict
    """
    
    # 1. Get or create avatar
    avatar = db.query(Avatar).filter(Avatar.user_id == user_id).first()
    if not avatar:
        logger.info(f"Creating new avatar for user {user_id}")
        avatar = Avatar(
            user_id=user_id,
            base_dna=get_default_dna(),
            physique_metrics=get_default_physique(),
            equipped_gear={}
        )
        db.add(avatar)
    
    # 2. Fetch weekly workout data if not provided
    if weekly_data is None:
        weekly_data = await fetch_weekly_workout_data(user_id, db)
    
    # 3. Calculate new physique metrics
    old_metrics = avatar.physique_metrics.copy() if avatar.physique_metrics else {}
    new_metrics = calculate_physique_from_data(weekly_data)
    
    # 4. Apply smoothing (don't change too drastically in one update)
    smoothed_metrics = smooth_metrics(old_metrics, new_metrics, smoothing_factor=0.3)
    
    # 5. Update avatar
    avatar.physique_metrics = smoothed_metrics
    avatar.updated_at = datetime.utcnow()
    
    # 6. Check for milestone notifications
    notifications = check_physique_milestones(old_metrics, smoothed_metrics, user_id)
    
    db.commit()
    
    return {
        "user_id": user_id,
        "old_metrics": old_metrics,
        "new_metrics": smoothed_metrics,
        "notifications": notifications
    }


def calculate_physique_from_data(weekly_data: Dict[str, Any]) -> Dict[str, float]:
    """
    Translates workout data into normalized physique attributes.
    All values are 0.0 to 1.0.
    """
    
    # Extract data with defaults
    total_volume = weekly_data.get("total_volume_kg", 0)
    upper_volume = weekly_data.get("upper_body_volume_kg", 0)
    cardio_minutes = weekly_data.get("cardio_minutes", 0)
    avg_steps = weekly_data.get("avg_daily_steps", 0)
    hydration_streak = weekly_data.get("hydration_streak_days", 0)
    sleep_quality = weekly_data.get("avg_sleep_quality", 50)
    mobility_sessions = weekly_data.get("mobility_sessions", 0)
    
    # Calculate normalized metrics
    muscle_mass = min(total_volume / NORMALIZATION["weekly_volume_kg"], 1.0)
    
    # Shoulder width scales more with upper body work
    shoulder_width = min(upper_volume / (NORMALIZATION["weekly_volume_kg"] * 0.4), 1.0)
    
    # Arm definition - combination of isolation work and overall training
    arm_definition = min(
        (weekly_data.get("arm_isolation_sets", 0) * 100 + total_volume * 0.1) / 
        NORMALIZATION["weekly_volume_kg"], 
        1.0
    )
    
    # Leanness from cardio + steps (not just gym, real daily movement)
    cardio_score = min(cardio_minutes / NORMALIZATION["weekly_cardio_min"], 1.0)
    steps_score = min(avg_steps / 10000, 1.0)  # 10k steps = good
    leanness = (cardio_score * 0.6 + steps_score * 0.4)
    
    # Energy aura from lifestyle factors
    hydration_score = min(hydration_streak / NORMALIZATION["hydration_streak"], 1.0)
    sleep_score = min(sleep_quality / NORMALIZATION["sleep_quality_avg"], 1.0)
    energy_aura = (hydration_score * 0.5 + sleep_score * 0.5)
    
    # Posture from mobility work
    posture_score = min(mobility_sessions / NORMALIZATION["mobility_sessions"], 1.0)
    
    return {
        "muscle_mass": round(muscle_mass, 3),
        "shoulder_width": round(shoulder_width, 3),
        "arm_definition": round(arm_definition, 3),
        "leanness": round(leanness, 3),
        "energy_aura": round(energy_aura, 3),
        "posture_score": round(posture_score, 3)
    }


def smooth_metrics(
    old: Dict[str, float], 
    new: Dict[str, float], 
    smoothing_factor: float = 0.3
) -> Dict[str, float]:
    """
    Applies exponential smoothing to prevent jarring visual changes.
    smoothing_factor: How much of the new value to use (0.0-1.0)
    """
    smoothed = {}
    for key in new:
        old_val = old.get(key, 0.0)
        new_val = new[key]
        smoothed[key] = round(old_val * (1 - smoothing_factor) + new_val * smoothing_factor, 3)
    return smoothed


def check_physique_milestones(
    old: Dict[str, float], 
    new: Dict[str, float],
    user_id: str
) -> list:
    """
    Check for milestone achievements and queue notifications.
    """
    notifications = []
    
    # Muscle milestones
    if new.get("muscle_mass", 0) >= 0.5 and old.get("muscle_mass", 0) < 0.5:
        notifications.append({
            "type": "AVATAR_MILESTONE",
            "title": "💪 ¡Tu Avatar se ve más fuerte!",
            "body": "Has alcanzado el 50% de masa muscular máxima.",
            "user_id": user_id
        })
    
    if new.get("muscle_mass", 0) >= 0.8 and old.get("muscle_mass", 0) < 0.8:
        notifications.append({
            "type": "AVATAR_MILESTONE", 
            "title": "🏆 ¡Nivel BEAST desbloqueado!",
            "body": "Tu Avatar ahora tiene una musculatura elite.",
            "user_id": user_id
        })
    
    # Energy aura milestone
    if new.get("energy_aura", 0) >= 0.9 and old.get("energy_aura", 0) < 0.9:
        notifications.append({
            "type": "AVATAR_GLOW",
            "title": "✨ ¡Aura Dorada activada!",
            "body": "Tu hidratación y sueño están en su punto máximo.",
            "user_id": user_id
        })
    
    return notifications


def get_default_dna() -> Dict[str, Any]:
    """Returns default DNA for new avatars."""
    return {
        "skin_tone": "#C4A583",
        "hair_style": "short_classic",
        "hair_color": "#2C1810",
        "gender": "neutral",
        "body_type": "average",
        "face_shape": "oval"
    }


def get_default_physique() -> Dict[str, float]:
    """Returns starting physique for new users."""
    return {
        "muscle_mass": 0.2,
        "shoulder_width": 0.2,
        "arm_definition": 0.15,
        "leanness": 0.3,
        "energy_aura": 0.5,
        "posture_score": 0.4
    }


async def fetch_weekly_workout_data(user_id: str, db: "Session") -> Dict[str, Any]:
    """
    Fetches workout data from the last 7 days.
    TODO: Implement actual database queries.
    """
    # Placeholder - replace with actual queries
    return {
        "total_volume_kg": 2500,
        "upper_body_volume_kg": 1200,
        "cardio_minutes": 120,
        "avg_daily_steps": 8500,
        "hydration_streak_days": 5,
        "avg_sleep_quality": 72,
        "mobility_sessions": 3,
        "arm_isolation_sets": 20
    }


# ═══════════════════════════════════════════════════════════════════════════
# GEAR MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════

async def equip_item(user_id: str, item_slug: str, db: "Session") -> Dict[str, Any]:
    """
    Equips an owned item to the avatar.
    """
    avatar = db.query(Avatar).filter(Avatar.user_id == user_id).first()
    if not avatar:
        return {"error": "Avatar not found"}
    
    # Check if user owns the item
    if item_slug not in (avatar.owned_items or []):
        return {"error": "Objeto no adquirido", "item": item_slug}
    
    # Get item category from catalog (simplified)
    category = get_item_category(item_slug)
    
    # Equip
    equipped = avatar.equipped_gear or {}
    equipped[category] = item_slug
    avatar.equipped_gear = equipped
    avatar.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"success": True, "equipped": equipped}


async def purchase_item(
    user_id: str, 
    item_slug: str, 
    price: int,
    db: "Session"
) -> Dict[str, Any]:
    """
    Purchases an item and adds to inventory.
    Deducts Vital Points from user wallet.
    """
    # TODO: Implement wallet deduction and item catalog lookup
    avatar = db.query(Avatar).filter(Avatar.user_id == user_id).first()
    if not avatar:
        return {"error": "Avatar not found"}
    
    owned = avatar.owned_items or []
    if item_slug in owned:
        return {"error": "Objeto ya adquirido"}
    
    owned.append(item_slug)
    avatar.owned_items = owned
    avatar.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"success": True, "item": item_slug, "total_owned": len(owned)}


def get_item_category(item_slug: str) -> str:
    """Maps item slug to category. TODO: Use database lookup."""
    category_map = {
        "tank_top": "torso",
        "tshirt": "torso", 
        "shorts": "legs",
        "pants": "legs",
        "sneakers": "footwear",
        "watch": "accessory",
        "headband": "headwear",
        "cap": "headwear"
    }
    for prefix, category in category_map.items():
        if item_slug.startswith(prefix):
            return category
    return "accessory"

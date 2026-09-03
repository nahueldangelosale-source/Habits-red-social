"""
AVATAR MODEL - The Digital Twin
Genotipo (Base) + Fenotipo (Effort) + Inventario (Cosmetics)
"""

from sqlalchemy import Column, String, Integer, ForeignKey, Float, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

# Using a simple Base - adjust import based on your project structure
try:
    from app.db.base import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


class Avatar(Base):
    """
    The Digital Twin - A visual representation that reflects real effort.
    
    Design Philosophy:
    - Genotipo (base_dna): Immutable identity chosen at creation
    - Fenotipo (physique_metrics): Mutable attributes from real workout data
    - Inventario (equipped_gear): Cosmetics purchased with Vital Points
    """
    __tablename__ = "avatars"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    # ═══════════════════════════════════════════════════════════════════════════
    # 1. EL GENOTIPO (Inmutable - Identidad Base)
    # ═══════════════════════════════════════════════════════════════════════════
    base_dna = Column(JSONB, default=dict)
    # Structure:
    # {
    #   "skin_tone": "#8D5524",
    #   "hair_style": "buzz_cut",
    #   "hair_color": "#1a1a1a",
    #   "gender": "neutral",  # Options: "masculine", "feminine", "neutral"
    #   "body_type": "athletic",  # Starting template
    #   "face_shape": "oval"
    # }
    
    # ═══════════════════════════════════════════════════════════════════════════
    # 2. EL FENOTIPO (Mutable - Refleja el esfuerzo real)
    # These values (0.0 to 1.0) are recalculated nightly by a Cron Job
    # ═══════════════════════════════════════════════════════════════════════════
    physique_metrics = Column(JSONB, default=dict)
    # Structure:
    # {
    #   "muscle_mass": 0.45,      # From weekly volume (kg lifted)
    #   "shoulder_width": 0.30,   # Scales with upper body work
    #   "arm_definition": 0.35,   # Biceps/triceps isolation work
    #   "leanness": 0.12,         # From cardio + nutrition adherence
    #   "energy_aura": 0.8,       # From hydration/sleep streaks
    #   "posture_score": 0.6      # From mobility/stretching logs
    # }
    
    # ═══════════════════════════════════════════════════════════════════════════
    # 3. EL INVENTARIO (Cosmético - Se compra con Vital Points)
    # ═══════════════════════════════════════════════════════════════════════════
    equipped_gear = Column(JSONB, default=dict)
    # Structure:
    # {
    #   "torso": "tank_top_neon",
    #   "legs": "shorts_camo", 
    #   "footwear": "running_shoes_pro",
    #   "accessory": "smart_watch_gold",
    #   "headwear": null,
    #   "special_effect": "fire_aura"  # Unlocked at 30-day streak
    # }
    
    # Owned items (purchased but not equipped)
    owned_items = Column(JSONB, default=list)
    # ["tank_top_neon", "shorts_camo", "headband_red", ...]
    
    # ═══════════════════════════════════════════════════════════════════════════
    # 4. ACHIEVEMENT UNLOCKS (Visual badges/effects)
    # ═══════════════════════════════════════════════════════════════════════════
    unlocked_effects = Column(JSONB, default=list)
    # ["fire_aura", "lightning_bg", "champion_crown", "1k_club_badge"]
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AvatarItem(Base):
    """
    Catalog of purchasable cosmetic items.
    """
    __tablename__ = "avatar_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    name = Column(String, nullable=False)  # "Neon Tank Top"
    slug = Column(String, unique=True, nullable=False)  # "tank_top_neon"
    
    category = Column(String, nullable=False)  # "torso", "legs", "accessory", etc.
    
    # Visual asset
    asset_url = Column(String)  # SVG or image URL
    preview_url = Column(String)  # Thumbnail for store
    
    # Pricing
    price_points = Column(Integer, default=0)  # Vital Points cost
    
    # Availability
    is_premium = Column(Integer, default=0)  # 1 = requires subscription
    unlock_requirement = Column(JSONB, nullable=True)
    # {"type": "streak", "value": 30} = Unlocks at 30-day streak
    # {"type": "level", "value": 10} = Unlocks at level 10
    # {"type": "achievement", "value": "first_5k"} = Unlocks after running 5k
    
    # Metadata
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    
    created_at = Column(DateTime, default=datetime.utcnow)

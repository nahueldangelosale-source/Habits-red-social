"""
WAGER MODEL - The Arena (P2P Betting System)
Escrow-based wagering with automatic and manual verification.
"""

from sqlalchemy import Column, String, Integer, ForeignKey, Float, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

try:
    from app.db.base import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


# ═══════════════════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════════════════

class WagerStatus(enum.Enum):
    """State machine for wager lifecycle."""
    PENDING_ACCEPTANCE = "PENDING"      # Waiting for opponent to accept
    ACTIVE = "ACTIVE"                   # Both accepted, points in escrow
    AWAITING_SYNC = "SYNC"              # Waiting for wearable data sync (12h window)
    AWAITING_VERIFICATION = "REVIEW"    # Flagged for Pro review
    COMPLETED = "COMPLETED"             # Winner declared, points transferred
    CANCELLED = "CANCELLED"             # Declined or expired
    DISPUTED = "DISPUTED"               # Both parties contest result


class ChallengeMetric(enum.Enum):
    """Metrics that can be wagered on."""
    # Auto-verified (Data Wagers)
    STEPS_COUNT = "STEPS"               # Total steps in 24h
    ACTIVE_ENERGY_BURNED = "CALORIES"   # Active calories (not BMR)
    DISTANCE_KM = "DISTANCE"            # Total distance
    WORKOUT_MINUTES = "WORKOUT_TIME"    # Active workout minutes
    
    # Manual verification (Honor Wagers)
    WEIGHT_LOSS_PCT = "WEIGHT_LOSS"     # % body weight lost over period
    SQUAT_FORM = "SQUAT_FORM"           # Best squat technique (video)
    CUSTOM = "CUSTOM"                   # Free-form challenge


class VerificationType(enum.Enum):
    """How the wager will be verified."""
    AUTOMATIC = "AUTO"      # HealthKit/Garmin data
    MANUAL = "MANUAL"       # Pro reviews evidence
    HYBRID = "HYBRID"       # Auto with integrity check


# ═══════════════════════════════════════════════════════════════════════════
# MAIN WAGER MODEL
# ═══════════════════════════════════════════════════════════════════════════

class Wager(Base):
    """
    P2P Wager with escrow system.
    Points are locked until resolution.
    """
    __tablename__ = "wagers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Scope: Only users within same tenant/coach can wager
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    
    # Participants
    challenger_id = Column(String, ForeignKey("users.id"), nullable=False)
    opponent_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # The Stakes
    stake_amount = Column(Integer, nullable=False)  # Points each party risks
    escrow_total = Column(Integer, default=0)       # Total locked (stake * 2)
    
    # The Challenge
    challenge_type = Column(Enum(ChallengeMetric), nullable=False)
    verification_type = Column(Enum(VerificationType), default=VerificationType.AUTOMATIC)
    
    # Time bounds
    challenge_start = Column(DateTime, nullable=False)  # When counting begins
    challenge_end = Column(DateTime, nullable=False)    # 23:59 cutoff
    sync_deadline = Column(DateTime)                    # 12:00 next day (Golden Hour)
    
    # Custom challenge description (for CUSTOM type)
    challenge_description = Column(Text, nullable=True)
    
    # ═══════════════════════════════════════════════════════════════════════
    # EVIDENCE
    # ═══════════════════════════════════════════════════════════════════════
    
    # Data Wager: Auto-collected metrics
    metrics_challenger = Column(JSONB, nullable=True)
    # {"steps": 12500, "source": "Apple Health", "raw_data_id": "..."}
    
    metrics_opponent = Column(JSONB, nullable=True)
    
    # Honor Wager: Manual proof uploads
    proof_media_url_challenger = Column(String, nullable=True)
    proof_media_url_opponent = Column(String, nullable=True)
    
    # ═══════════════════════════════════════════════════════════════════════
    # INTEGRITY & ANTI-FRAUD
    # ═══════════════════════════════════════════════════════════════════════
    
    integrity_flags = Column(JSONB, default=list)
    # [
    #   {"user_id": "...", "flag": "LOW_HR_HIGH_CAL", "severity": "warning"},
    #   {"user_id": "...", "flag": "CONSTANT_CADENCE", "severity": "suspicious"}
    # ]
    
    # ═══════════════════════════════════════════════════════════════════════
    # RESOLUTION
    # ═══════════════════════════════════════════════════════════════════════
    
    status = Column(Enum(WagerStatus), default=WagerStatus.PENDING_ACCEPTANCE)
    winner_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Pro verification (for MANUAL/HYBRID)
    verified_by_pro_id = Column(String, ForeignKey("users.id"), nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# WAGER VERIFICATION LOG
# ═══════════════════════════════════════════════════════════════════════════

class WagerVerification(Base):
    """
    Audit trail for wager data collection and integrity checks.
    """
    __tablename__ = "wager_verifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    wager_id = Column(String, ForeignKey("wagers.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Data source
    source_name = Column(String)  # "Apple Health", "Garmin Connect", "Manual Entry"
    source_device = Column(String, nullable=True)  # "Apple Watch Series 9"
    
    # Raw values
    metric_type = Column(String)  # "steps", "calories", etc.
    raw_value = Column(Float)
    
    # Integrity scoring (0.0 to 1.0)
    # 1.0 = Perfect sensor data, verified
    # 0.8 = Minor anomalies but acceptable
    # < 0.5 = Flagged for manual review
    integrity_score = Column(Float, default=1.0)
    
    integrity_checks = Column(JSONB, default=dict)
    # {
    #   "hr_consistency": true,
    #   "cadence_variance": 0.85,
    #   "source_is_sensor": true,
    #   "flags": []
    # }
    
    verified_at = Column(DateTime, default=datetime.utcnow)


# ═══════════════════════════════════════════════════════════════════════════
# ESCROW TRANSACTION LOG
# ═══════════════════════════════════════════════════════════════════════════

class WagerEscrow(Base):
    """
    Tracks point movements for wagers.
    Immutable audit trail for disputes.
    """
    __tablename__ = "wager_escrow"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    wager_id = Column(String, ForeignKey("wagers.id"), nullable=False)
    
    # Transaction type
    action = Column(String)  # "LOCK", "RELEASE_TO_WINNER", "REFUND", "FORFEIT"
    
    user_id = Column(String, ForeignKey("users.id"))
    amount = Column(Integer)
    
    # Balance tracking
    balance_before = Column(Integer)
    balance_after = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)

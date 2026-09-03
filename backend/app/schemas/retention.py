from typing import Optional
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# ==========================================
# AthleteCompassionWallet Schemas
# ==========================================

class AthleteCompassionWalletBase(BaseModel):
    available_streak_freezes: int = 0
    recovery_tokens_balance: int = 0
    hibernation_status: bool = False
    fatigue_index: float = 0.0

class AthleteCompassionWalletCreate(AthleteCompassionWalletBase):
    client_id: uuid.UUID

class AthleteCompassionWalletUpdate(BaseModel):
    available_streak_freezes: Optional[int] = None
    recovery_tokens_balance: Optional[int] = None
    hibernation_status: Optional[bool] = None
    fatigue_index: Optional[float] = None

class AthleteCompassionWalletOut(AthleteCompassionWalletBase):
    id: uuid.UUID
    client_id: uuid.UUID
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# AthleteLegacy Schemas
# ==========================================

class AthleteLegacyBase(BaseModel):
    current_legacy_level: int = 1
    total_consistency_gems: int = 0
    days_active_metabolism: int = 0

class AthleteLegacyCreate(AthleteLegacyBase):
    client_id: uuid.UUID

class AthleteLegacyUpdate(BaseModel):
    current_legacy_level: Optional[int] = None
    total_consistency_gems: Optional[int] = None
    days_active_metabolism: Optional[int] = None

class AthleteLegacyOut(AthleteLegacyBase):
    id: uuid.UUID
    client_id: uuid.UUID
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

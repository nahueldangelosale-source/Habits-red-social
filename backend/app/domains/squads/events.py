from datetime import datetime
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from typing import Dict, Any, List

class DomainEvent(BaseModel):
    """Base class for all immutable domain events."""
    event_id: UUID = Field(default_factory=uuid4)
    aggregate_id: UUID
    aggregate_type: str
    event_type: str
    version: int
    payload: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Specific Events for Squads Domain
class SquadCreated(DomainEvent):
    event_type: str = "SquadCreated"

class MemberJoined(DomainEvent):
    event_type: str = "MemberJoined"

class ActivityLogged(DomainEvent):
    event_type: str = "ActivityLogged"

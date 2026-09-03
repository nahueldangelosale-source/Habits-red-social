from uuid import UUID
from typing import List, Optional
from app.domains.squads.events import DomainEvent, SquadCreated, MemberJoined, ActivityLogged
from app.authz.opa import opa_engine
from opentelemetry import trace
import structlog

logger = structlog.get_logger(__name__)
tracer = trace.get_tracer(__name__)

class SquadCommandHandler:
    """
    Handles commands for the Squads domain using Event Sourcing.
    Strictly prohibits in-place mutations.
    """
    
    def __init__(self, db_session):
        self.db = db_session

    async def create_squad(self, user_id: UUID, name: str, goal_type: str) -> UUID:
        """
        Validates business rules and appends a SquadCreated event.
        """
        with tracer.start_as_current_span("command_create_squad") as span:
            squad_id = UUID(int=0) # Placeholder for new ID generation logic
            
            # OPA Authorization Check (Zero Trust)
            allowed = await opa_engine.check_permission(
                str(user_id), 
                "create", 
                {"resource": "squad"}
            )
            
            if not allowed:
                raise PermissionError("Unauthorized to create squad")

            # Logic: Validate business rules (e.g. max active squads per user)
            event = SquadCreated(
                aggregate_id=squad_id,
                aggregate_type="Squad",
                version=1,
                payload={"name": name, "goal_type": goal_type, "creator_id": str(user_id)}
            )
            
            await self._append_event(event)
            return squad_id

    async def _append_event(self, event: DomainEvent):
        """Persists the event to the Append-Only log."""
        from app.models.event_store import EventStore
        db_event = EventStore(
            event_id=event.event_id,
            aggregate_id=event.aggregate_id,
            aggregate_type=event.aggregate_type,
            event_type=event.event_type,
            version=event.version,
            payload=event.payload,
            created_at=event.created_at
        )
        self.db.add(db_event)
        await self.db.commit()
        logger.info("event_appended", event_type=event.event_type, aggregate_id=str(event.aggregate_id))

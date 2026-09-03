import asyncio
from mcp.server import Server
from mcp.types import Tool, TextContent
from opentelemetry import trace
from app.domains.squads.commands import SquadCommandHandler
from app.authz.opa import opa_engine
from uuid import UUID

tracer = trace.get_tracer(__name__)

# Intent-First MCP Design
squads_server = Server("bienestar-squads")

@squads_server.tool()
async def squad_create(name: str, leader_id: UUID) -> str:
    """Creates a new squad with Zero Trust Audit."""
    with tracer.start_as_current_span("execute_tool") as span:
        # GenAI Semantic Conventions 3.0 (2026)
        span.set_attribute("gen_ai.operation.name", "execute_tool")
        span.set_attribute("mcp.tool.name", "squad_create")
        
        # Event: Prompt Capture (Input)
        span.add_event("gen_ai.prompt", {"content": f"name={name}, leader_id={leader_id}"})
        
        try:
            handler = SquadCommandHandler()
            event = await handler.handle_create_squad(name, leader_id)
            result = f"Squad created: {event.squad_id}"
            
            # Event: Completion Capture (Output)
            span.add_event("gen_ai.completion", {"content": result})
            return result
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR))
            raise e

@squads_server.tool()
async def squad_join(squad_id: UUID, member_name: str) -> str:
    """Adds a member to a squad via Event Sourcing & OPA."""
    with tracer.start_as_current_span("execute_tool") as span:
        span.set_attribute("gen_ai.operation.name", "execute_tool")
        span.set_attribute("mcp.tool.name", "squad_join")
        
        span.add_event("gen_ai.prompt", {"content": f"squad_id={squad_id}, member={member_name}"})
        
        handler = SquadCommandHandler()
        event = await handler.handle_join_squad(squad_id, member_name)
        result = f"Member {member_name} joined squad {squad_id}"
        
        span.add_event("gen_ai.completion", {"content": result})
        return result

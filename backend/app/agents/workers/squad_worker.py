from app.agents.base import BaseAgent
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import json
import structlog
from opentelemetry import trace

logger = structlog.get_logger(__name__)
tracer = trace.get_tracer(__name__)

class SquadWorker(BaseAgent):
    """
    Specialized Worker Agent for the Squads MCP domain.
    Equipped with Resilience (Tenacity) to handle Behavioral Chaos.
    """
    def __init__(self):
        super().__init__(name="SquadWorker", role="DomainSpecialist")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ValueError, json.JSONDecodeError))
    )
    async def execute_mcp_tool(self, tool_name: str, args: dict) -> str:
        """
        Executes a tool from the MCP server with resilience logic.
        Tests Behavioral Recovery against Malformed JSON.
        """
        with tracer.start_as_current_span(f"execute_tool_{tool_name}") as span:
            span.set_attribute("gen_ai.operation.name", "execute_tool")
            span.set_attribute("mcp.tool.name", tool_name)
            
            # Logic: Simulate MCP interaction
            # If Behavioral Chaos is injected, this might fail
            logger.info("mcp_tool_execution", tool=tool_name, args=args)
            
            # Potential failure point for Chaos Injection
            return f"Tool {tool_name} executed successfully."

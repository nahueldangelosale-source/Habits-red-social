from opentelemetry import trace
from typing import Any, Dict, Optional, List
import structlog
import asyncio

logger = structlog.get_logger(__name__)
tracer = trace.get_tracer(__name__)

class BaseAgent:
    """
    Base Agent class with OpenTelemetry 3.0 GenAI Semantic Conventions.
    """
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    async def run_step(self, task: str, reasoning: str) -> str:
        """
        Executes an agentic step with causal tracing.
        """
        with tracer.start_as_current_span("agent_step") as span:
            # GenAI Semantic Conventions 2026
            span.set_attribute("gen_ai.operation.name", "agent_step")
            span.set_attribute("agent.name", self.name)
            span.set_attribute("agent.role", self.role)
            span.set_attribute("agent.reasoning", reasoning)
            
            # Event: Prompt
            span.add_event("gen_ai.prompt", {"content": task})
            
            # Logic: Simulate LLM thinking/execution
            logger.info("agent_action", agent=self.name, task=task, reasoning=reasoning)
            
            # Placeholder for actual LLM call
            result = f"Result of {task} by {self.name}"
            
            # Event: Completion
            span.add_event("gen_ai.completion", {"content": result})
            return result

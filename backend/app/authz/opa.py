import httpx
from opentelemetry import trace
from typing import Any, Dict, Optional
import structlog

logger = structlog.get_logger(__name__)
tracer = trace.get_tracer(__name__)

class OPADecisionEngine:
    """
    Zero Trust Authorization Engine using Open Policy Agent.
    Decouples authz logic from business implementation.
    """
    
    def __init__(self, opa_url: str = "http://localhost:8181/v1/data/bienestar/authz"):
        self.opa_url = opa_url

    async def check_permission(
        self, 
        user_id: str, 
        action: str, 
        resource_data: Dict[str, Any],
        user_context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Evaluates authorization via OPA.
        Instrumented with OTel for auditing.
        """
        with tracer.start_as_current_span("opa_authorization_check") as span:
            span.set_attribute("security.authorization.action", action)
            span.set_attribute("security.authorization.user_id", user_id)
            
            payload = {
                "input": {
                    "user_id": user_id,
                    "action": action,
                    **resource_data,
                    **(user_context or {})
                }
            }
            
            try:
                async with httpx.AsyncClient() as client:
                    # Querying the policy for the specific domain (e.g. squads)
                    # For MVP, we point to the specific policy package
                    response = await client.post(f"{self.opa_url}/squads/allow", json=payload)
                    response.raise_for_status()
                    
                    decision = response.json().get("result", False)
                    
                    # OTel Convention for Security Decisions
                    span.set_attribute("security.authorization.decision", "ALLOW" if decision else "DENY")
                    
                    if not decision:
                        span.set_status(trace.Status(trace.StatusCode.ERROR, "Access Denied by Policy"))
                        span.set_attribute("owasp.tag", "A07:2025") # Identification and Authentication Failures
                        logger.warning("authz_denied", user_id=user_id, action=action)
                    
                    return decision
                    
            except Exception as e:
                span.record_exception(e)
                span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
                logger.error("opa_query_failed", error=str(e))
                return False

opa_engine = OPADecisionEngine()

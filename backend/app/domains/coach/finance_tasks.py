import time
import structlog
from app.celery_app import celery_app
from mcp_servers.finance_server import finance_mcp_server
from security.agentic_gateway import PolicyEnforcementPoint, AgenticGatewayError

logger = structlog.get_logger()
gateway = PolicyEnforcementPoint(finance_mcp_server)

@celery_app.task(bind=True, name="coach.audit_financial_retention")
def audit_financial_retention_task(self, coach_id: str, spiffe_token: str, human_signature: str = None) -> dict:
    """
    WORKER FINANCIERO (CELERY)
    Audita clientes morosos y ejecuta mutaciones financieras en el agente bajo la supervisión del Agentic Gateway.
    """
    logger.info("finance_audit_started", task_id=self.request.id, coach_id=coach_id)

    # 1. SPIFFE Token Validation (Simulated)
    if not spiffe_token or "eyJhbGciOiJIUzI1Ni" not in spiffe_token:
         return {"status": "FAILED", "error": "Invalid SPIFFE/SPIRE Token"}

    try:
        # 2. Leer Morosos del Server MCP (Operación de Seguridad Baja)
        read_response = gateway.execute_mcp_tool(
            agent_id=f"celery_finops_{self.request.id}",
            tool_name="list_delinquent_clients",
            arguments={}
        )
        delinquent_clients = read_response.get("data", [])

        # 3. Intentar Mutación Automática (Proponer Draft de Pago a todos)
        proposals = []
        for client in delinquent_clients:
            try:
                 # Esto FALLARÁ en el Gateway si no proveemos `human_signature`
                 draft_response = gateway.execute_mcp_tool(
                     agent_id=f"celery_finops_{self.request.id}",
                     tool_name="draft_payment_link",
                     arguments={"client_id": client["id"], "amount": client["amount_due"]},
                     human_signature=human_signature
                 )
                 proposals.append({
                     "client_id": client["id"],
                     "action": "DRAFT_LINK_GENERATED",
                     "details": draft_response["data"]
                 })
            except AgenticGatewayError as e:
                 proposals.append({
                     "client_id": client["id"],
                     "action": "BLOCKED_BY_GATEWAY",
                     "details": str(e)
                 })

        return {
            "status": "SUCCESS",
            "result": {
                 "scanned_clients": len(delinquent_clients),
                 "mcp_proposals": proposals,
                 "requires_human_approval": any(p["action"] == "BLOCKED_BY_GATEWAY" for p in proposals)
            }
        }

    except Exception as ex:
        logger.error("finance_audit_failed", error=str(ex))
        return {"status": "FAILED", "error": str(ex)}

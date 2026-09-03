import structlog
from typing import Dict, Any

logger = structlog.get_logger()

class AgenticGatewayError(Exception):
    pass

class PolicyEnforcementPoint:
    """
    AGENTIC GATEWAY (PEP)
    Middleware Determinista Zero Trust que audita las llamadas del Agente al Servidor MCP Financiero.
    """

    def __init__(self, mcp_server):
        self.mcp = mcp_server
        self._mock_mrr_cache = 45000.00  # En producción, se lee sincrónicamente de la DB/Stripe

    def execute_mcp_tool(self, agent_id: str, tool_name: str, arguments: Dict[str, Any], human_signature: str = None) -> Dict[str, Any]:
        """
        Bloquea o enruta la llamada hacia el servidor subyacente de MCP, evaluando restricciones rígidas.
        """
        logger.info("pep_evaluation_started", agent_id=agent_id, tool_name=tool_name)

        # 1. READ-ONLY TOOLS (Fast Path sin firma)
        if tool_name in ["get_mrr", "list_delinquent_clients"]:
             return self.mcp.execute_tool(tool_name, arguments)
        
        # 2. WRITE/MUTATION TOOLS (Zero Trust Path)
        if tool_name in ["draft_payment_link", "propose_refund"]:
             
             # HARD CONSTRAINT A: Firma Humana Obligatoria
             if not human_signature or "AUTHORIZE_FINANCE_" not in human_signature:
                 logger.warning("pep_blocked_unsigned_mutation", tool_name=tool_name, agent_id=agent_id)
                 raise AgenticGatewayError({
                     "code": "AUTH_REQUIRED",
                     "message": f"Zero Trust Block: La herramienta mutacional '{tool_name}' carece de una 'human_signature' válida de un Coach L6."
                 })

             # HARD CONSTRAINT B: Límite de Reembolso (Financial SafetyNet)
             if tool_name == "propose_refund":
                 amount = arguments.get("amount", 0)
                 max_allowed = self._mock_mrr_cache * 0.10  # 10% del MRR

                 if amount > max_allowed:
                     logger.error("pep_blocked_refund_limit", requested=amount, max_allowed=max_allowed)
                     raise AgenticGatewayError({
                         "code": "FINOPS_LIMIT_EXCEEDED",
                         "message": f"Zero Trust Block: El reembolso propuesto de ${amount} supera el límite máximo permitido del 10% del MRR (${max_allowed}). Invocación abortada."
                     })

             # Si todas las políticas se cumplen, delegamos al MCP
             logger.info("pep_authorized_mutation", tool_name=tool_name, amount=arguments.get('amount'))
             return self.mcp.execute_tool(tool_name, arguments)
             
        # Herramienta Desconocida
        raise AgenticGatewayError({"code": "UNKNOWN_TOOL", "message": f"Tool '{tool_name}' is not manifested."})


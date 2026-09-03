import json
from typing import Dict, Any, List
import os
import mercadopago
import structlog

logger = structlog.get_logger()

class MercadoPagoMCPServer:
    """
    Model Context Protocol (MCP) Server - LATAM FinOps
    Integra dinámicamente MercadoPago para la jurisdicción LATAM.
    Mantiene intactos los contratos del Agentic Gateway.
    """
    
    def __init__(self):
        # Inicializar SDK de MP
        self.mp_access_token = os.getenv("MP_ACCESS_TOKEN", "APP_USR-mock-token-123")
        self.sdk = mercadopago.SDK(self.mp_access_token)
        
        # Base de datos en memoria para el mock
        self.mock_metrics = {
            "mrr": 45000.00,
            "currency": "ARS" # Adaptado a LATAM
        }
        
        self.mock_delinquent_clients = [
            {"id": "cli_1xyz", "name": "Atleta Alfa", "amount_due": 15000.00, "days_late": 12},
            {"id": "cli_2abc", "name": "Atleta Beta", "amount_due": 30000.00, "days_late": 35}
        ]

    def list_tools(self) -> List[Dict[str, Any]]:
        """Devuelve el manifiesto de herramientas expuestas al agente."""
        return [
            {
                "name": "get_mrr",
                "description": "Obtiene el Monthly Recurring Revenue actual nominal.",
                "parameters": {}
            },
            {
                "name": "list_delinquent_clients",
                "description": "Lista los clientes con pagos atrasados.",
                "parameters": {}
            },
            {
                "name": "draft_payment_link",
                "description": "Propone un link de pago para cobrar a un cliente moroso usando MercadoPago.",
                "parameters": {
                    "client_id": "string",
                    "amount": "number"
                }
            },
            {
                "name": "propose_refund",
                "description": "Ejecuta un reembolso a un cliente a través de MP.",
                "parameters": {
                    "client_id": "string",
                    "amount": "number",
                    "reason": "string"
                }
            }
        ]

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Enrutador de ejecución del servidor MCP."""
        
        if tool_name == "get_mrr":
            return {"status": "success", "data": self.mock_metrics}
            
        elif tool_name == "list_delinquent_clients":
            return {"status": "success", "data": self.mock_delinquent_clients}
            
        elif tool_name == "draft_payment_link":
            client_id = arguments.get("client_id")
            amount = arguments.get("amount", 0)
            
            try:
                # INTEGRACIÓN MERCADOPAGO (Crear Preferencia)
                preference_data = {
                    "items": [
                        {
                            "id": f"recover_{client_id}",
                            "title": "Suscripción Atrasada Bienestar OS",
                            "quantity": 1,
                            "unit_price": amount,
                        }
                    ],
                    "payer": {
                         "name": f"Cliente {client_id}"
                    },
                    "back_urls": {
                        "success": "https://bienestar.app/coach/finance/success",
                        "pending": "https://bienestar.app/coach/finance/pending",
                        "failure": "https://bienestar.app/coach/finance/failure"
                    },
                    "auto_return": "approved",
                    "notification_url": "https://api.bienestar.app/api/webhooks/mercadopago"
                }
                
                # Descomentar en proc real:
                # preference_response = self.sdk.preference().create(preference_data)
                # preference = preference_response["response"]
                # init_point = preference["init_point"]
                
                init_point = f"https://www.mercadopago.com.ar/checkout/mock_{client_id}"
                
                return {
                    "status": "success", 
                    "data": {"link": init_point, "gateway": "MercadoPago"}
                }
            except Exception as e:
                logger.error("mp_preference_failed", error=str(e))
                return {"status": "error", "message": "Fallo al generar preferencia MP"}
            
        elif tool_name == "propose_refund":
            amount = arguments.get("amount", 0)
            
            # INTEGRACIÓN MERCADOPAGO (Reembolso)
            # En un caso real: self.sdk.refund().create(payment_id)
            # El Gateway ya auditó el límite del 10%.
            
            return {
                "status": "success",
                "data": {"refunded": amount, "transaction_id": "ref_mp_999", "gateway": "MercadoPago"}
            }
            
        else:
             raise ValueError(f"Unknown tool: {tool_name}")

# Instancia global (Singleton)
finance_mcp_server = MercadoPagoMCPServer()

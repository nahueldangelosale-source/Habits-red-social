import mercadopago
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Dict, Any
from app.config import get_settings

settings = get_settings()

@dataclass
class CheckoutSession:
    """Resultado inmutable del checkout."""
    redirect_url: str
    transaction_id: str
    provider: str

class FinOpsGateway(ABC):
    """Interfaz abstracta — Punto de Apalancamiento contra Vendor Lock-in."""
    
    @abstractmethod
    def create_checkout_session(
        self, amount: float, currency: str, 
        item_desc: str, metadata: dict
    ) -> CheckoutSession:
        ...
    
    @abstractmethod
    def process_webhook(self, payload: dict) -> dict:
        ...

    @abstractmethod
    def get_payment_info(self, payment_id: str) -> Optional[Dict[str, Any]]:
        ...

    @abstractmethod
    def get_preapproval_info(self, preapproval_id: str) -> Optional[Dict[str, Any]]:
        ...


class MercadoPagoAdapter(FinOpsGateway):
    def __init__(self):
        # Platform Token
        self.sdk = mercadopago.SDK(settings.mp_access_token or "TEST-ACCESS-TOKEN")

    def create_checkout_session(
        self, amount: float, currency: str, 
        item_desc: str, metadata: dict
    ) -> CheckoutSession:
        
        # Hardcoding ARS as instructed for the current horizon
        currency_code = "ARS"
        
        # Metadata expects external_reference and optionally pro_access_token & marketplace_fee
        external_ref = metadata.get("external_reference", "UNKNOWN")
        payer_email = metadata.get("payer_email", "guest@bienestar.app")
        pro_token = metadata.get("pro_access_token")
        marketplace_fee = metadata.get("marketplace_fee", 0.0)
        
        preference_data = {
            "items": [
                {
                    "title": item_desc,
                    "quantity": 1,
                    "unit_price": float(amount),
                    "currency_id": currency_code
                }
            ],
            "external_reference": external_ref,
            "payer": {
                "email": payer_email
            },
            "back_urls": {
                "success": "https://bienestar.app/payment/success",
                "failure": "https://bienestar.app/payment/failure",
                "pending": "https://bienestar.app/payment/pending"
            },
            "auto_return": "approved",
            "notification_url": "https://api.bienestar.app/api/v1/webhooks/mercadopago"
        }

        # If it's a split payment for B2B2C, use the pro token
        if pro_token and float(marketplace_fee) > 0:
            preference_data["marketplace_fee"] = float(marketplace_fee)
            sdk_to_use = mercadopago.SDK(pro_token)
        else:
            sdk_to_use = self.sdk

        preference_response = sdk_to_use.preference().create(preference_data)
        
        if preference_response["status"] == 201:
            init_point = preference_response["response"]["init_point"]
            # En producción se debería usar sandbox_init_point si estamos en testing
            return CheckoutSession(
                redirect_url=init_point,
                transaction_id=external_ref,
                provider="MERCADO_PAGO"
            )
        else:
            raise Exception(f"Error creating MP preference: {preference_response}")

    def process_webhook(self, payload: dict) -> dict:
        # La validación HMAC está en webhooks.py
        return {"status": "ok"}

    def get_payment_info(self, payment_id: str) -> Optional[Dict[str, Any]]:
        payment_response = self.sdk.payment().get(payment_id)
        if payment_response["status"] == 200:
            return payment_response["response"]
        return None

    def get_preapproval_info(self, preapproval_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.sdk.preapproval().get(preapproval_id)
            if response["status"] == 200:
                return response["response"]
        except:
            pass
        return None


class PaymentGatewayFactory:
    @staticmethod
    def get_gateway(provider: str) -> FinOpsGateway:
        if provider.upper() == "MERCADO_PAGO":
            return MercadoPagoAdapter()
        elif provider.upper() == "STRIPE":
            raise NotImplementedError("StripeAdapter not implemented in this iteration.")
        else:
            # Default fallback for legacy usages
            return MercadoPagoAdapter()

# Keep instance for legacy compatibility during Dark Launch
payment_service = MercadoPagoAdapter()

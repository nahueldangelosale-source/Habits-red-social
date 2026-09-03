import httpx
import structlog
from typing import Optional

from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()

RESEND_API_URL = "https://api.resend.com/emails"

async def send_magic_link(email: str, magic_url: str, coach_name: Optional[str] = None) -> bool:
    """
    Envía un Magic Link utilizando Resend API.
    Si no hay API key configurada, simula el envío (log).
    """
    if not settings.resend_api_key:
        logger.warning("resend_api_key_not_configured", magic_url=magic_url, to_email=email)
        return True # Simulamos envío exitoso en local/dev
        
    try:
        sender_name = coach_name if coach_name else "AUREA Bienestar"
        
        payload = {
            "from": "Bienestar <onboarding@aurea-wellness.com>", # Debe ser un dominio verificado en Resend
            "to": [email],
            "subject": f"Tu acceso seguro a {sender_name}",
            "html": f"""
            <h2>Bienvenido a tu plataforma</h2>
            <p>Haz clic en el siguiente enlace para iniciar sesión de forma segura sin contraseña:</p>
            <p><a href="{magic_url}" style="display:inline-block;padding:10px 20px;background-color:#CEFF00;color:#000;text-decoration:none;font-weight:bold;border-radius:5px;">Confirmar Acceso</a></p>
            <p><small>Este enlace expirará en 72 horas.</small></p>
            """
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                RESEND_API_URL,
                json=payload,
                headers={"Authorization": f"Bearer {settings.resend_api_key}"}
            )
            response.raise_for_status()
            logger.info("magic_link_email_sent", email=email)
            return True
    except Exception as e:
        logger.error("magic_link_email_failed", error=str(e), email=email)
        return False

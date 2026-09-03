from dataclasses import dataclass
from typing import Dict, Any
import urllib.parse

@dataclass
class NotificationPayload:
    title: str
    body_template: str
    context_variables: Dict[str, Any]


class MessageGenerator:
    """
    Abstracción pura del generador de mensajes.
    No conoce la existencia de WhatsApp ni de ningún canal específico.
    Solo genera el payload agnóstico con la plantilla y el contexto.
    """
    @staticmethod
    def generate_intervention_payload(cri_score: int, context: Dict[str, Any]) -> NotificationPayload:
        if cri_score >= 80:
            return NotificationPayload(
                title="Intervención Crítica",
                body_template="¡Hola {nombre}! Noté que llevas {dias_inactivos} días sin venir y te extrañamos. ¿Todo bien? Te guardé un lugar para tu próxima clase, avísame si quieres cambiar el horario.",
                context_variables=context
            )
        else:
            return NotificationPayload(
                title="Seguimiento Preventivo",
                body_template="¡Hola {nombre}! Veo que tu ritmo ha bajado un poco esta semana. ¡No aflojes! Recuerda que la constancia es la clave. ¿Te agendo para mañana?",
                context_variables=context
            )


from collections import defaultdict

class WhatsAppDeliveryAdapter:
    """
    Capa de Adaptadores (Adapter Pattern).
    Toma el payload agnóstico y lo transforma en un Deep Link específico para WhatsApp.
    """
    @staticmethod
    def format_deep_link(phone: str, payload: NotificationPayload) -> str:
        # Validación básica de número de teléfono (debe incluir código internacional)
        clean_phone = ''.join(filter(str.isdigit, phone))
        
        # Ingeniería Defensiva: Uso de format_map con un fallback para evitar KeyErrors destructivos
        try:
            safe_context = defaultdict(lambda: "[N/A]", payload.context_variables)
            message = payload.body_template.format_map(safe_context)
        except Exception:
            # Fallback absoluto para garantizar que el link operativo no se rompa
            message = f"{payload.title}: Revisar estado en Bienestar APP."
            
        encoded_message = urllib.parse.quote(message)
        return f"https://wa.me/{clean_phone}?text={encoded_message}"

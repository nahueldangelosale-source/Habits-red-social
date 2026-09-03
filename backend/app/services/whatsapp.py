"""
WhatsApp Intelligence Service - "El Guardián"
Module B: Gateway inteligente para WhatsApp Business API

Arquitectura de 2 Capas:
Layer 1: Guardrails Determinísticos (Regex/Keywords - Safety Net)
Layer 2: Intent Classifier + RAG (AI-Powered Responses)

Flujo:
1. Webhook recibe mensaje
2. Layer 1: Check palabras de ALTO RIESGO → Si detecta, STOP AI + Alert Pro
3. Layer 2: Clasificar intent (Logistics/Casual/Question)
4. Generar respuesta apropiada (DB Query o RAG)
"""

import re
from datetime import datetime
from enum import Enum
from typing import Optional, Tuple
from uuid import UUID

from pydantic import BaseModel, Field


# =============================================================================
# ENUMS Y MODELOS
# =============================================================================

class RiskLevel(str, Enum):
    """Nivel de riesgo del mensaje."""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class MessageIntent(str, Enum):
    """Intención clasificada del mensaje (Gatekeeper AI Triaje)."""
    LOGISTICS = "logistics"               # Agenda, pagos (Auto-resolved)
    TECHNICAL = "technical"               # Nutrición, Ejercicios (RAG Auto-resolved)
    COMPLEX_EMOTIONAL = "complex_emotional"# Lesiones, desmotivación (P1 Human Batching)
    EMERGENCY = "emergency"               # Detectado por guardrails
    UNKNOWN = "unknown"


class GuardrailResult(BaseModel):
    """Resultado del análisis de guardrails."""
    is_safe: bool
    risk_level: RiskLevel
    triggered_patterns: list[str] = Field(default_factory=list)
    recommended_action: str
    static_response: Optional[str] = None


class ClassifiedMessage(BaseModel):
    """Mensaje clasificado con intent y contexto."""
    original_text: str
    intent: MessageIntent
    confidence: float
    entities: dict = Field(default_factory=dict)
    requires_human: bool = False


class WhatsAppResponse(BaseModel):
    """Respuesta generada para enviar al usuario."""
    text: Optional[str] = None
    is_automated: bool = True
    source: str  # "guardrail", "rag", "template", "human_batched"
    professional_alerted: bool = False
    priority: str = "normal"  # "normal", "P1"


# =============================================================================
# GUARDRAILS - LAYER 1 (Determinístico)
# =============================================================================

class GuardrailsService:
    """
    Capa de seguridad determinística.
    Detecta palabras de alto riesgo SIN usar AI.
    """
    
    # Patrones de ALTO RIESGO - Disparan alerta inmediata
    CRITICAL_PATTERNS = [
        # Emergencias de salud mental
        r"\b(suicid|matarme|quitarme la vida|no quiero vivir)\b",
        r"\b(autolesion|cortarme|hacerme daño)\b",
        # Emergencias médicas
        r"\b(infarto|ataque al corazón|convulsion|desmay)\b",
        r"\b(sangr(e|ando|o) mucho|hemorragia)\b",
        r"\b(no puedo respirar|ahog[aá]ndome)\b",
        # Dolor severo
        r"\b(dolor insoportable|dolor muy fuerte|agonía)\b",
        r"\b(dolor (en el )?pecho)\b",
        # Emergencia general
        r"\b(emergencia|urgente|ayuda urgente|llama(r)? ambulancia)\b",
        r"\b(hospital|urgencias|guardia)\b",
    ]
    
    # Patrones de RIESGO MEDIO - Requieren atención pronto
    MEDIUM_PATTERNS = [
        r"\b(mareo|náusea|vómit)\b",
        r"\b(lesion|lastim[eé]|dolor fuerte)\b",
        r"\b(ansiedad|ataque de p[aá]nico|angustia)\b",
        r"\b(no (puedo|logro) dormir)\b",
        r"\b(deprimi|depresión|triste todo el tiempo)\b",
    ]
    
    # Respuesta estática para emergencias
    EMERGENCY_RESPONSE = """🚨 *Mensaje detectado como urgente*

Si estás experimentando una emergencia médica, por favor:
• Llama al *107* (Emergencias Argentina)
• O acude al hospital más cercano

Tu profesional de bienestar ha sido notificado y te contactará lo antes posible.

_Este es un mensaje automático de seguridad._"""
    
    MENTAL_HEALTH_RESPONSE = """💚 *Tu bienestar es importante*

Entendemos que puedes estar pasando por un momento difícil.

Si necesitas hablar con alguien ahora:
• *Centro de Asistencia al Suicida*: 135 (24hs)
• *Línea de Salud Mental*: 0800-999-0091

Tu profesional ha sido alertado y te contactará personalmente.

_Recuerda: pedir ayuda es un acto de valentía._"""
    
    def __init__(self):
        # Compilar patterns para eficiencia
        self.critical_regex = [re.compile(p, re.IGNORECASE) for p in self.CRITICAL_PATTERNS]
        self.medium_regex = [re.compile(p, re.IGNORECASE) for p in self.MEDIUM_PATTERNS]
    
    def analyze(self, message: str) -> GuardrailResult:
        """
        Analiza un mensaje buscando patrones de riesgo.
        
        Args:
            message: Texto del mensaje de WhatsApp
            
        Returns:
            GuardrailResult con nivel de riesgo y acción recomendada
        """
        message_lower = message.lower()
        triggered = []
        
        # Check CRITICAL patterns
        for pattern in self.critical_regex:
            match = pattern.search(message_lower)
            if match:
                triggered.append(match.group())
        
        if triggered:
            # Determinar tipo de emergencia
            is_mental_health = any(
                term in message_lower 
                for term in ["suicid", "matarme", "autolesion", "cortarme"]
            )
            
            return GuardrailResult(
                is_safe=False,
                risk_level=RiskLevel.CRITICAL,
                triggered_patterns=triggered,
                recommended_action="STOP_AI_ALERT_PRO",
                static_response=(
                    self.MENTAL_HEALTH_RESPONSE if is_mental_health 
                    else self.EMERGENCY_RESPONSE
                )
            )
        
        # Check MEDIUM patterns
        for pattern in self.medium_regex:
            match = pattern.search(message_lower)
            if match:
                triggered.append(match.group())
        
        if triggered:
            return GuardrailResult(
                is_safe=True,  # Puede continuar, pero con precaución
                risk_level=RiskLevel.MEDIUM,
                triggered_patterns=triggered,
                recommended_action="PROCEED_WITH_CAUTION",
                static_response=None
            )
        
        # Mensaje seguro
        return GuardrailResult(
            is_safe=True,
            risk_level=RiskLevel.NONE,
            triggered_patterns=[],
            recommended_action="PROCEED_NORMAL",
            static_response=None
        )


# =============================================================================
# INTENT CLASSIFIER - LAYER 2 (AI-Powered)
# =============================================================================

class IntentClassifierService:
    """
    Clasificador de intenciones usando heurísticas y AI.
    """
    
    # Patrones para clasificación rápida (sin AI)
    LOGISTICS_PATTERNS = [
        r"\b(horario|hora|cuando|cita|turno|cancel|reprogramar)\b",
        r"\b(dónde|direccion|ubicacion|llegar)\b",
        r"\b(precio|costo|pago|tarifa|abono|factura)\b",
        r"\b(hola|chau|gracias|nos vemos)\b",  # Englobado en logística para auto-reply
    ]
    
    TECHNICAL_PATTERNS = [
        r"\b(puedo|debo|tengo que|cómo|qué|cuál|cuánto)\b",
        r"\b(dieta|comida|ejercicio|rutina|proteína|carbohidrato|suplemento)\b",
        r"\b(creatina|batido|peso|repeticiones|descanso|rm)\b",
        r"\b(alternativa|cambiar ejercicio|no hay máquina)\b",
    ]
    
    COMPLEX_EMOTIONAL_PATTERNS = [
        r"\b(dolor|molestia|lesión|me tir[oó]|pinchazo)\b",
        r"\b(desmotivad[oa]|no tengo ganas|frustrad[oa]|estancad[oa])\b",
        r"\b(cansad[oa]|agotad[oa]|no doy m[aá]s)\b",
        r"\b(no (logr[eé]|puedo|cumpl[ií]))\b",
    ]
    
    def __init__(self):
        self.logistics_regex = [re.compile(p, re.IGNORECASE) for p in self.LOGISTICS_PATTERNS]
        self.technical_regex = [re.compile(p, re.IGNORECASE) for p in self.TECHNICAL_PATTERNS]
        self.complex_regex = [re.compile(p, re.IGNORECASE) for p in self.COMPLEX_EMOTIONAL_PATTERNS]
    
    def classify(self, message: str) -> ClassifiedMessage:
        """
        Clasifica la intención del mensaje en el Triaje Gatekeeper.
        """
        message_lower = message.lower()
        scores = {
            MessageIntent.LOGISTICS: 0,
            MessageIntent.TECHNICAL: 0,
            MessageIntent.COMPLEX_EMOTIONAL: 0,
        }
        
        # Calcular scores por categoría
        for pattern in self.logistics_regex:
            if pattern.search(message_lower):
                scores[MessageIntent.LOGISTICS] += 1
                
        for pattern in self.technical_regex:
            if pattern.search(message_lower):
                scores[MessageIntent.TECHNICAL] += 1
                
        for pattern in self.complex_regex:
            if pattern.search(message_lower):
                scores[MessageIntent.COMPLEX_EMOTIONAL] += 2 # Peso doble para emociones/lesiones
        
        # Determinar intent con mayor score
        max_score = max(scores.values())
        if max_score == 0:
            return ClassifiedMessage(
                original_text=message,
                intent=MessageIntent.UNKNOWN,
                confidence=0.3,
                requires_human=True
            )
        
        # Encontrar intent ganador
        winner = max(scores, key=scores.get)
        total_patterns = sum(
            len(getattr(self, f"{intent.value}_regex", [])) 
            for intent in scores
        )
        confidence = min(0.95, 0.5 + (max_score / total_patterns) * 2)
        
        return ClassifiedMessage(
            original_text=message,
            intent=winner,
            confidence=confidence,
            requires_human=confidence < 0.6
        )


# =============================================================================
# RESPONSE GENERATOR
# =============================================================================

class ResponseGeneratorService:
    """
    Genera respuestas basadas en el intent clasificado.
    """
    
    # Templates para respuestas automáticas
    TEMPLATES = {
        MessageIntent.LOGISTICS: {
            "schedule": "📅 Para consultar o modificar tu cita, puedes hacerlo desde el panel de reservas de la app.",
            "location": "📍 El consultorio está ubicado en las instalaciones principales.",
            "payment": "💳 Puedes consultar los métodos de pago disponibles o estado de cuenta desde la sección Billetera.",
            "default": "¡Hola! He recibido tu mensaje de logística. El sistema registrará esto en tu perfil."
        },
    }
    
    def generate_rag_response(self, message: str, coach_philosophy: Optional[str] = None) -> str:
        """
        Simula la respuesta generada por RAG basada en la BD Global + Filosofía del Entrenador.
        """
        # Aquí iría la integración con Langchain / VectorDB.
        base = "📚 *Bienestar AI Coach*: "
        if coach_philosophy:
            return base + f"Basado en los lineamientos de tu entrenador: La creatina y el entrenamiento de fuerza son fundamentales. {message}"
        return base + "Según nuestra base de datos biomédica global, te sugerimos ajustar los rangos de repeticiones."
    
    def generate_template_response(
        self, 
        intent: MessageIntent, 
        subtype: str = "default"
    ) -> Optional[str]:
        """Genera respuesta desde template."""
        templates = self.TEMPLATES.get(intent, {})
        return templates.get(subtype) or list(templates.values())[0] if templates else None
    
    def generate_fallback_response(self) -> str:
        """Respuesta cuando no hay match claro."""
        return (
            "Gracias por tu mensaje. 📩\n\n"
            "Tu profesional revisará tu consulta y te responderá pronto. "
            "Si es urgente, por favor indícalo."
        )


# =============================================================================
# MAIN SERVICE - ORCHESTRATOR
# =============================================================================

class WhatsAppIntelligenceService:
    """
    Orquestador principal del módulo WhatsApp.
    Coordina guardrails, clasificación y generación de respuestas.
    """
    
    def __init__(self):
        self.guardrails = GuardrailsService()
        self.classifier = IntentClassifierService()
        self.response_gen = ResponseGeneratorService()
    
    async def process_message(
        self,
        message: str,
        sender_phone: str,
        professional_id: Optional[UUID] = None,
    ) -> Tuple[WhatsAppResponse, GuardrailResult, ClassifiedMessage]:
        """
        Procesa un mensaje de WhatsApp end-to-end.
        
        Args:
            message: Texto del mensaje entrante
            sender_phone: Número del remitente
            professional_id: UUID del profesional asignado (para alertas)
            
        Returns:
            Tuple de (Respuesta, Resultado Guardrails, Mensaje Clasificado)
        """
        # LAYER 1: Guardrails
        guardrail_result = self.guardrails.analyze(message)
        
        if not guardrail_result.is_safe:
            # STOP AI - Enviar respuesta estática
            return (
                WhatsAppResponse(
                    text=guardrail_result.static_response or "",
                    is_automated=True,
                    source="guardrail",
                    professional_alerted=True
                ),
                guardrail_result,
                ClassifiedMessage(
                    original_text=message,
                    intent=MessageIntent.EMERGENCY,
                    confidence=1.0,
                    requires_human=True
                )
            )
        
        # LAYER 2: Clasificación (Triaje)
        classified = self.classifier.classify(message)
        
        # Generar respuesta según Triaje
        if classified.intent == MessageIntent.LOGISTICS:
            response_text = self.response_gen.generate_template_response(
                MessageIntent.LOGISTICS, "default"
            )
            return (
                WhatsAppResponse(
                    text=response_text,
                    is_automated=True,
                    source="template",
                    professional_alerted=False
                ),
                guardrail_result,
                classified
            )
            
        elif classified.intent == MessageIntent.TECHNICAL:
            # Respuesta Técnica Automática vía RAG (Soporta Filosofía del Entrenador y Base Global)
            response_text = self.response_gen.generate_rag_response(
                message, coach_philosophy="Enfoque de hipertrofia y dieta flexible"
            )
            return (
                WhatsAppResponse(
                    text=response_text,
                    is_automated=True,
                    source="rag",
                    professional_alerted=False
                ),
                guardrail_result,
                classified
            )
            
        elif classified.intent == MessageIntent.COMPLEX_EMOTIONAL:
            # SILENT BATCHING - Bloqueo de auto-respuesta. Prioridad P1 para el humano.
            return (
                WhatsAppResponse(
                    text=None,  # No se envía respuesta automática
                    is_automated=False,
                    source="human_batched",
                    professional_alerted=True,
                    priority="P1"
                ),
                guardrail_result,
                classified
            )
            
        else:
            # UNKNOWN -> Fallback
            response_text = self.response_gen.generate_fallback_response()
            return (
                WhatsAppResponse(
                    text=response_text,
                    is_automated=True,
                    source="fallback",
                    professional_alerted=True,
                    priority="normal"
                ),
                guardrail_result,
                classified
            )


# Singleton del servicio
whatsapp_service = WhatsAppIntelligenceService()

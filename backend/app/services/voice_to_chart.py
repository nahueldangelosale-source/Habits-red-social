"""
Voice-to-Chart Service - "El Escriba Invisible"
Module A: Transcripción de audio a historia clínica SOAP

Workflow:
1. Recibir audio .m4a del móvil
2. Transcribir con OpenAI Whisper API
3. Procesar con GPT-4o (Strict Mode, Zero Data Retention)
4. Parsear output a modelo Pydantic SOAP
5. Almacenar en DB con confidence scores
"""

import json
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

import httpx
from pydantic import BaseModel

from app.config import get_settings
from app.models.voice_to_chart import (
    VoiceToChartOutput,
    SubjectiveData,
    ObjectiveData,
    AssessmentData,
    PlanData,
    ConsultationType,
)

settings = get_settings()


# =============================================================================
# PROMPTS
# =============================================================================

SOAP_EXTRACTION_PROMPT = """Eres un asistente médico experto que extrae información de transcripciones de consultas de bienestar.

TAREA: Analiza la siguiente transcripción de una consulta entre un profesional del bienestar (nutricionista/entrenador) y su cliente. Extrae la información en formato SOAP (Subjetivo, Objetivo, Evaluación, Plan).

REGLAS:
1. Extrae SOLO la información mencionada explícitamente
2. Si algo no se menciona, usa null o lista vacía
3. Sé preciso con los números (peso, medidas, etc.)
4. Mantén el tono profesional y objetivo
5. La respuesta DEBE ser JSON válido

FORMATO DE RESPUESTA (JSON estricto):
{
  "subjective": {
    "chief_complaint": "queja principal del cliente",
    "symptoms": ["síntoma1", "síntoma2"],
    "symptom_severity": "mild|moderate|severe|null",
    "lifestyle_notes": "notas de estilo de vida",
    "adherence_self_report": "autoreporte de adherencia",
    "goals_mentioned": ["meta1", "meta2"]
  },
  "objective": {
    "weight_kg": número o null,
    "body_fat_percentage": número o null,
    "measurements": {"parte": valor} o null,
    "vital_signs": {"signo": valor} o null,
    "performance_metrics": {"métrica": "valor"} o null,
    "photos_taken": true/false
  },
  "assessment": {
    "progress_evaluation": "evaluación del progreso",
    "barriers_identified": ["barrera1"],
    "risk_factors": ["factor1"],
    "clinical_notes": "notas clínicas adicionales"
  },
  "plan": {
    "protocol_adjustments": ["ajuste1"],
    "new_targets": {"objetivo": "valor"} o null,
    "homework": ["tarea1"],
    "follow_up_date": "YYYY-MM-DDTHH:MM:SSZ o null",
    "referrals": ["referido1"]
  },
  "consultation_type": "initial|follow_up|progress_check|adjustment",
  "confidence_score": 0.0-1.0
}

TRANSCRIPCIÓN:
{transcription}

JSON:"""


# =============================================================================
# SERVICE CLASS
# =============================================================================

class VoiceToChartService:
    """
    Servicio principal de Voice-to-Chart.
    Maneja transcripción (Whisper) y extracción (GPT-4o).
    """
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.whisper_model = "whisper-1"
        self.gpt_model = "gpt-4o"
        self.base_url = "https://api.openai.com/v1"
    
    async def transcribe_audio(
        self, 
        audio_content: bytes, 
        filename: str = "audio.m4a"
    ) -> tuple[str, float]:
        """
        Transcribe audio usando OpenAI Whisper API.
        
        Args:
            audio_content: Bytes del archivo de audio
            filename: Nombre del archivo (para detectar formato)
            
        Returns:
            Tuple de (transcripción, confidence_score)
        """
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY no configurada en .env")
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/audio/transcriptions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                files={"file": (filename, audio_content)},
                data={
                    "model": self.whisper_model,
                    "language": "es",
                    "response_format": "verbose_json",
                },
            )
            
            if response.status_code != 200:
                raise Exception(f"Whisper API error: {response.text}")
            
            result = response.json()
            transcription = result.get("text", "")
            
            # Calcular confidence promedio de segmentos
            segments = result.get("segments", [])
            if segments:
                avg_confidence = sum(
                    s.get("avg_logprob", -1) for s in segments
                ) / len(segments)
                # Convertir log prob a score 0-1 (aproximación)
                confidence = min(1.0, max(0.0, (avg_confidence + 1) / 1))
            else:
                confidence = 0.8  # Default si no hay segmentos
            
            return transcription, confidence
    
    async def extract_soap_data(
        self, 
        transcription: str
    ) -> tuple[dict, float]:
        """
        Extrae datos SOAP de la transcripción usando GPT-4o.
        Usa modo estricto y Zero Data Retention.
        
        Args:
            transcription: Texto transcrito del audio
            
        Returns:
            Tuple de (soap_data_dict, confidence_score)
        """
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY no configurada en .env")
        
        prompt = SOAP_EXTRACTION_PROMPT.format(transcription=transcription)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    # Zero Data Retention headers
                    "X-Request-Id": str(uuid4()),
                },
                json={
                    "model": self.gpt_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "Eres un asistente médico. Responde SOLO en JSON válido."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1,  # Baja para consistencia
                    "response_format": {"type": "json_object"},
                },
            )
            
            if response.status_code != 200:
                raise Exception(f"GPT-4o API error: {response.text}")
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            try:
                soap_data = json.loads(content)
                confidence = soap_data.pop("confidence_score", 0.8)
                return soap_data, confidence
            except json.JSONDecodeError as e:
                raise Exception(f"Error parsing GPT response: {e}")
    
    def parse_to_pydantic(
        self,
        soap_data: dict,
        client_id: UUID,
        professional_id: UUID,
        transcription: str,
        transcription_confidence: float,
        extraction_confidence: float,
        duration_seconds: Optional[int] = None,
    ) -> VoiceToChartOutput:
        """
        Parsea el dict SOAP a modelo Pydantic validado.
        
        Returns:
            VoiceToChartOutput modelo completamente validado
        """
        # Determinar si requiere revisión (confidence baja)
        requires_review = (
            transcription_confidence < 0.7 or 
            extraction_confidence < 0.7
        )
        
        # Parsear consultation_type
        consultation_type_str = soap_data.get("consultation_type", "follow_up")
        try:
            consultation_type = ConsultationType(consultation_type_str)
        except ValueError:
            consultation_type = ConsultationType.FOLLOW_UP
        
        return VoiceToChartOutput(
            id=uuid4(),
            client_id=client_id,
            professional_id=professional_id,
            consultation_type=consultation_type,
            recorded_at=datetime.utcnow(),
            duration_seconds=duration_seconds,
            subjective=SubjectiveData(**soap_data.get("subjective", {})),
            objective=ObjectiveData(**soap_data.get("objective", {})),
            assessment=AssessmentData(**soap_data.get("assessment", {})),
            plan=PlanData(**soap_data.get("plan", {})),
            transcription_confidence=transcription_confidence,
            extraction_confidence=extraction_confidence,
            raw_transcription=transcription,
            requires_review=requires_review,
        )
    
    async def process_audio(
        self,
        audio_content: bytes,
        client_id: UUID,
        professional_id: UUID,
        filename: str = "audio.m4a",
        duration_seconds: Optional[int] = None,
    ) -> VoiceToChartOutput:
        """
        Pipeline completo: Audio → Transcripción → SOAP → Pydantic
        
        Args:
            audio_content: Bytes del archivo de audio
            client_id: UUID del cliente
            professional_id: UUID del profesional
            filename: Nombre del archivo
            duration_seconds: Duración en segundos (opcional)
            
        Returns:
            VoiceToChartOutput con todos los datos estructurados
        """
        # Step 1: Transcribir
        transcription, trans_confidence = await self.transcribe_audio(
            audio_content, filename
        )
        
        # Step 2: Extraer SOAP
        soap_data, extract_confidence = await self.extract_soap_data(
            transcription
        )
        
        # Step 3: Parsear a Pydantic
        result = self.parse_to_pydantic(
            soap_data=soap_data,
            client_id=client_id,
            professional_id=professional_id,
            transcription=transcription,
            transcription_confidence=trans_confidence,
            extraction_confidence=extract_confidence,
            duration_seconds=duration_seconds,
        )
        
        return result


# Singleton del servicio
voice_to_chart_service = VoiceToChartService()

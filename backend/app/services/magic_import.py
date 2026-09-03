"""
Magic Import Service - "El Motor de Onboarding"
Module C: Importación de Excel/PDF legacy con Vision AI

Workflow:
1. Usuario sube foto de su rutina/dieta antigua (Excel, PDF, papel)
2. GPT-4o Vision analiza y extrae estructura
3. Se mapea al schema JSONB del sistema
4. Resultado: importación "mágica" con barrera de entrada = 0
"""

import base64
import json
from datetime import datetime
from enum import Enum
from typing import Optional, Any, Union, List
from uuid import UUID, uuid4

import httpx
from pydantic import BaseModel, Field

from app.config import get_settings

settings = get_settings()


# =============================================================================
# ENUMS Y MODELOS
# =============================================================================

class DocumentType(str, Enum):
    """Tipo de documento detectado."""
    DIET_PLAN = "diet_plan"
    WORKOUT_ROUTINE = "workout_routine"
    MEAL_PLAN = "meal_plan"
    SUPPLEMENT_SCHEDULE = "supplement_schedule"
    PROGRESS_CHART = "progress_chart"
    UNKNOWN = "unknown"


class ExtractionConfidence(str, Enum):
    """Nivel de confianza en la extracción."""
    HIGH = "high"        # >85% - Auto-import posible
    MEDIUM = "medium"    # 60-85% - Revisión sugerida
    LOW = "low"          # <60% - Revisión requerida


class ExtractedMeal(BaseModel):
    """Comida extraída de un plan de dieta."""
    name: str
    time: Optional[str] = None
    foods: list[str] = Field(default_factory=list)
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fats_g: Optional[float] = None
    notes: Optional[str] = None


class AdvancedExerciseSet(BaseModel):
    set_number: int
    reps: Union[int, str]
    weight_kg: Optional[float] = None
    rir: Optional[int] = None
    rpe: Optional[int] = None
    is_drop_set: bool = False


class ClinicalExercise(BaseModel):
    name: str
    tempo: Optional[str] = None
    sets_data: List[AdvancedExerciseSet] = Field(default_factory=list)
    rest_seconds: Optional[int] = None
    coach_notes: Optional[str] = None
    is_unilateral: bool = False


class BiomechanicalCircuit(BaseModel):
    circuit_type: str  # "EMOM", "AMRAP", "SUPERSET", "GIANT_SET", "LINEAR"
    duration_minutes: Optional[int] = None
    rounds: Optional[int] = None
    exercises: List[ClinicalExercise] = Field(default_factory=list)


class ExtractedWorkoutDay(BaseModel):
    """Día de entrenamiento extraído."""
    day_name: str  # "Lunes", "Día 1", "Push Day"
    muscle_groups: List[str] = Field(default_factory=list)
    circuits: List[BiomechanicalCircuit] = Field(default_factory=list)
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None


class ExtractedDietPlan(BaseModel):
    """Plan de dieta completo extraído."""
    title: Optional[str] = None
    type: Optional[str] = None  # "Keto", "Mediterránea", etc.
    daily_calories: Optional[int] = None
    meals: list[ExtractedMeal] = Field(default_factory=list)
    restrictions: list[str] = Field(default_factory=list)
    supplements: list[str] = Field(default_factory=list)
    notes: Optional[str] = None


class ExtractedWorkoutPlan(BaseModel):
    """Plan de entrenamiento completo extraído."""
    title: Optional[str] = None
    type: Optional[str] = None  # "PPL", "Full Body", "Upper/Lower"
    frequency: Optional[str] = None  # "4 días/semana"
    days: list[ExtractedWorkoutDay] = Field(default_factory=list)
    duration_weeks: Optional[int] = None
    notes: Optional[str] = None


class MagicImportResult(BaseModel):
    """Resultado completo de la importación."""
    id: UUID = Field(default_factory=uuid4)
    document_type: DocumentType
    confidence: ExtractionConfidence
    confidence_score: float
    diet_plan: Optional[ExtractedDietPlan] = None
    workout_plan: Optional[ExtractedWorkoutPlan] = None
    raw_extraction: dict = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)
    requires_review: bool = False
    processed_at: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# PROMPTS
# =============================================================================

VISION_EXTRACTION_PROMPT = """Eres un experto en nutrición y fitness con habilidad para leer y estructurar planes de entrenamiento y dietas.

TAREA: Analiza esta imagen que contiene un plan de dieta, rutina de ejercicios, o documento similar de bienestar. Extrae toda la información estructurada.

INSTRUCCIONES:
1. Primero identifica el TIPO de documento:
   - "diet_plan" = Plan de alimentación/dieta
   - "workout_routine" = Rutina de ejercicios/entrenamiento
   - "meal_plan" = Planificación de comidas semanal
   - "supplement_schedule" = Horario de suplementos
   - "progress_chart" = Tabla de progreso/medidas
   - "unknown" = No reconocido

2. Extrae TODA la información visible, incluyendo:
   - Nombres de comidas/ejercicios
   - Cantidades, series, repeticiones
   - Horarios si están indicados
   - Notas o instrucciones especiales

3. Si hay texto ilegible o ambiguo, inclúyelo con [?] marcador

FORMATO DE RESPUESTA (JSON estricto):
{
  "document_type": "diet_plan|workout_routine|meal_plan|supplement_schedule|progress_chart|unknown",
  "confidence_score": 0.0-1.0,
  "title": "título si es visible",
  "diet_plan": {
    "type": "tipo de dieta si se menciona",
    "daily_calories": número o null,
    "meals": [
      {
        "name": "Desayuno/Almuerzo/etc",
        "time": "08:00 o null",
        "foods": ["alimento1", "alimento2"],
        "calories": número o null,
        "protein_g": número o null,
        "carbs_g": número o null,
        "fats_g": número o null,
        "notes": "notas"
      }
    ],
    "restrictions": ["sin gluten", "vegetariano"],
    "supplements": ["Proteína", "Creatina"],
    "notes": "notas generales"
  },
  "workout_plan": {
    "type": "PPL, Full Body, etc",
    "frequency": "3 días/semana",
    "days": [
      {
        "day_name": "Lunes o Día 1",
        "muscle_groups": ["pecho", "tríceps"],
        "circuits": [
          {
            "circuit_type": "LINEAR|EMOM|AMRAP|SUPERSET",
            "rounds": 4,
            "exercises": [
              {
                "name": "Press de banca",
                "is_unilateral": false,
                "tempo": "3-1-X-0",
                "rest_seconds": 90,
                "coach_notes": "notas",
                "sets_data": [
                  {"set_number": 1, "reps": 12, "weight_kg": 60, "rir": 2, "rpe": 8, "is_drop_set": false}
                ]
              }
            ]
          }
        ],
        "duration_minutes": 60
      }
    ],
    "duration_weeks": número o null,
    "notes": "notas generales"
  },
  "warnings": ["lista de problemas detectados o campos ilegibles"]
}

RESPONDE SOLO CON JSON VÁLIDO."""


# =============================================================================
# SERVICE
# =============================================================================

class MagicImportService:
    """
    Servicio de importación mágica usando GPT-4o Vision.
    Convierte fotos de documentos legacy en datos estructurados.
    """
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.model = "gpt-4o"
        self.base_url = "https://api.openai.com/v1"
    
    def _encode_image(self, image_bytes: bytes) -> str:
        """Codifica imagen a base64 para API."""
        return base64.b64encode(image_bytes).decode("utf-8")
    
    def _determine_confidence(self, score: float) -> ExtractionConfidence:
        """Determina nivel de confianza."""
        if score >= 0.85:
            return ExtractionConfidence.HIGH
        elif score >= 0.60:
            return ExtractionConfidence.MEDIUM
        else:
            return ExtractionConfidence.LOW
    
    async def extract_from_image(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg"
    ) -> MagicImportResult:
        """
        Extrae datos estructurados de una imagen de documento.
        
        Args:
            image_bytes: Bytes de la imagen
            mime_type: Tipo MIME (image/jpeg, image/png, etc.)
            
        Returns:
            MagicImportResult con datos extraídos
        """
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY no configurada en .env")
        
        # Codificar imagen
        image_b64 = self._encode_image(image_bytes)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": VISION_EXTRACTION_PROMPT},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{image_b64}",
                                        "detail": "high"
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": 4096,
                    "response_format": {"type": "json_object"},
                },
            )
            
            if response.status_code != 200:
                raise Exception(f"GPT-4o Vision error: {response.text}")
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            try:
                extracted = json.loads(content)
            except json.JSONDecodeError as e:
                raise Exception(f"Error parsing response: {e}")
        
        return self._build_result(extracted)
    
    def _build_result(self, extracted: dict) -> MagicImportResult:
        """Construye el resultado estructurado."""
        doc_type_str = extracted.get("document_type", "unknown")
        try:
            doc_type = DocumentType(doc_type_str)
        except ValueError:
            doc_type = DocumentType.UNKNOWN
        
        confidence_score = extracted.get("confidence_score", 0.5)
        confidence = self._determine_confidence(confidence_score)
        
        # Parsear plan de dieta si existe
        diet_plan = None
        if extracted.get("diet_plan") and extracted["diet_plan"].get("meals"):
            dp = extracted["diet_plan"]
            diet_plan = ExtractedDietPlan(
                title=extracted.get("title"),
                type=dp.get("type"),
                daily_calories=dp.get("daily_calories"),
                meals=[ExtractedMeal(**m) for m in dp.get("meals", [])],
                restrictions=dp.get("restrictions", []),
                supplements=dp.get("supplements", []),
                notes=dp.get("notes"),
            )
        
        # Parsear plan de workout si existe
        workout_plan = None
        if extracted.get("workout_plan") and extracted["workout_plan"].get("days"):
            wp = extracted["workout_plan"]
            days = []
            for day in wp.get("days", []):
                circuits = []
                for circ in day.get("circuits", []):
                    exs = []
                    for ex in circ.get("exercises", []):
                        sets_data = [AdvancedExerciseSet(**sd) for sd in ex.get("sets_data", [])]
                        exs.append(ClinicalExercise(
                            name=ex.get("name", ""),
                            tempo=ex.get("tempo"),
                            sets_data=sets_data,
                            rest_seconds=ex.get("rest_seconds"),
                            coach_notes=ex.get("coach_notes"),
                            is_unilateral=ex.get("is_unilateral", False)
                        ))
                    circuits.append(BiomechanicalCircuit(
                        circuit_type=circ.get("circuit_type", "LINEAR"),
                        duration_minutes=circ.get("duration_minutes"),
                        rounds=circ.get("rounds"),
                        exercises=exs
                    ))
                days.append(ExtractedWorkoutDay(
                    day_name=day.get("day_name", "Día"),
                    muscle_groups=day.get("muscle_groups", []),
                    circuits=circuits,
                    duration_minutes=day.get("duration_minutes"),
                    notes=day.get("notes"),
                ))
            workout_plan = ExtractedWorkoutPlan(
                title=extracted.get("title"),
                type=wp.get("type"),
                frequency=wp.get("frequency"),
                days=days,
                duration_weeks=wp.get("duration_weeks"),
                notes=wp.get("notes"),
            )
        
        warnings = extracted.get("warnings", [])
        requires_review = confidence != ExtractionConfidence.HIGH or len(warnings) > 0
        
        return MagicImportResult(
            document_type=doc_type,
            confidence=confidence,
            confidence_score=confidence_score,
            diet_plan=diet_plan,
            workout_plan=workout_plan,
            raw_extraction=extracted,
            warnings=warnings,
            requires_review=requires_review,
        )
    
    def generate_demo_result(self, demo_type: str = "workout") -> MagicImportResult:
        """Genera resultado de demo sin llamar a la API."""
        if demo_type == "diet":
            return MagicImportResult(
                document_type=DocumentType.DIET_PLAN,
                confidence=ExtractionConfidence.HIGH,
                confidence_score=0.92,
                diet_plan=ExtractedDietPlan(
                    title="Plan Alimentación - Fase Definición",
                    type="Hipocalórica alta proteína",
                    daily_calories=1800,
                    meals=[
                        ExtractedMeal(
                            name="Desayuno",
                            time="07:30",
                            foods=["Avena 50g", "Claras 4 unidades", "Banana 1/2", "Café sin azúcar"],
                            calories=350,
                            protein_g=28,
                            carbs_g=45,
                            fats_g=5,
                        ),
                        ExtractedMeal(
                            name="Almuerzo",
                            time="12:30",
                            foods=["Pechuga grillada 150g", "Arroz integral 100g", "Ensalada mixta", "Aceite oliva 1 cda"],
                            calories=520,
                            protein_g=45,
                            carbs_g=40,
                            fats_g=15,
                        ),
                        ExtractedMeal(
                            name="Merienda",
                            time="16:00",
                            foods=["Yogurt griego 200g", "Nueces 20g", "Manzana 1"],
                            calories=280,
                            protein_g=18,
                            carbs_g=25,
                            fats_g=12,
                        ),
                        ExtractedMeal(
                            name="Cena",
                            time="20:00",
                            foods=["Salmón 150g", "Vegetales asados 200g", "Palta 1/4"],
                            calories=450,
                            protein_g=35,
                            carbs_g=15,
                            fats_g=28,
                        ),
                    ],
                    restrictions=["Sin azúcar refinada", "Mínimo procesados"],
                    supplements=["Proteína whey post-entreno", "Omega 3"],
                    notes="Mantener 2L agua diarios. Ajustar porciones según actividad.",
                ),
                warnings=[],
                requires_review=False,
            )
        else:
            return MagicImportResult(
                document_type=DocumentType.WORKOUT_ROUTINE,
                confidence=ExtractionConfidence.HIGH,
                confidence_score=0.89,
                workout_plan=ExtractedWorkoutPlan(
                    title="Rutina Push-Pull-Legs",
                    type="PPL",
                    frequency="6 días/semana",
                    days=[
                        ExtractedWorkoutDay(
                            day_name="Push (Lunes/Jueves)",
                            muscle_groups=["pecho", "hombros", "tríceps"],
                            circuits=[BiomechanicalCircuit(circuit_type="LINEAR", rounds=1, exercises=[ClinicalExercise(name="Press banca", sets_data=[])])],
                            duration_minutes=75,
                        ),
                        ExtractedWorkoutDay(
                            day_name="Pull (Martes/Viernes)",
                            muscle_groups=["espalda", "bíceps", "antebrazos"],
                            circuits=[BiomechanicalCircuit(circuit_type="LINEAR", rounds=1, exercises=[ClinicalExercise(name="Dominadas", sets_data=[])])],
                            duration_minutes=70,
                        ),
                        ExtractedWorkoutDay(
                            day_name="Legs (Miércoles/Sábado)",
                            muscle_groups=["cuádriceps", "isquiotibiales", "glúteos", "pantorrillas"],
                            circuits=[BiomechanicalCircuit(circuit_type="LINEAR", rounds=1, exercises=[ClinicalExercise(name="Sentadilla", sets_data=[])])],
                            duration_minutes=80,
                        ),
                    ],
                    duration_weeks=8,
                    notes="Progresión: aumentar peso cuando completar rango alto de reps.",
                ),
                warnings=[],
                requires_review=False,
            )


# Singleton
magic_import_service = MagicImportService()

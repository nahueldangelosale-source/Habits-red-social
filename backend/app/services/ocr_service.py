import abc
import random
import time
from typing import Dict, Any, Tuple

class OCRStrategy(abc.ABC):
    @abc.abstractmethod
    def extract_clinical_data(self, file_url: str, mime_type: str) -> Tuple[Dict[str, Any], float]:
        """
        Extracts clinical data from a document.
        Returns a tuple of (extracted_data_json, confidence_score)
        """
        pass


class MockOCRStrategy(OCRStrategy):
    """
    Mock Strategy para entornos de desarrollo. Simula la latencia de un LLM Visión
    y devuelve datos aleatorios con un confidence score variable para testear
    los flujos de Human-in-the-Loop.
    """
    def extract_clinical_data(self, file_url: str, mime_type: str) -> Tuple[Dict[str, Any], float]:
        # Simular latencia de red e inferencia de IA (5 a 12 segundos)
        time.sleep(random.randint(5, 12))
        
        # Simular fallo catastrófico (PDF corrupto) un 10% de las veces
        if random.random() < 0.1:
            raise ValueError("El archivo está corrupto o es ilegible.")

        # Generar un confidence_score aleatorio (60% a 99%)
        confidence_score = random.uniform(0.60, 0.99)
        
        # Payload sugerido simulado (Biomarcadores detectados)
        extracted_data = {
            "biomarkers": {
                "glucose": {
                    "value": random.randint(80, 120),
                    "unit": "mg/dL",
                    "reference_range": "70-99"
                },
                "ldl_cholesterol": {
                    "value": random.randint(90, 160) if confidence_score > 0.8 else 900, # Inyectamos "error" si la confianza es baja
                    "unit": "mg/dL",
                    "reference_range": "<100"
                },
                "hdl_cholesterol": {
                    "value": random.randint(35, 65),
                    "unit": "mg/dL",
                    "reference_range": ">40"
                },
                "triglycerides": {
                    "value": random.randint(100, 200),
                    "unit": "mg/dL",
                    "reference_range": "<150"
                }
            },
            "detected_pathologies": ["dyslipidemia"] if confidence_score > 0.7 else [],
            "raw_text_snippet": "LABORATORY REPORT - Patient shows signs of elevated lipids."
        }
        
        return extracted_data, confidence_score


class AWSOCRStrategy(OCRStrategy):
    """
    Placeholder para la implementación real en Producción usando AWS Textract
    o GPT-4o Vision API.
    """
    def extract_clinical_data(self, file_url: str, mime_type: str) -> Tuple[Dict[str, Any], float]:
        raise NotImplementedError("La integración con Textract/GPT-4o está planeada para la Fase 41.")


class OCRService:
    def __init__(self, strategy: OCRStrategy):
        self._strategy = strategy
        
    def extract(self, file_url: str, mime_type: str) -> Tuple[Dict[str, Any], float]:
        return self._strategy.extract_clinical_data(file_url, mime_type)

# Singleton factory or Dependency Injection placeholder
def get_ocr_service(env: str = "development") -> OCRService:
    if env == "production":
        # return OCRService(AWSOCRStrategy()) # Para cuando esté listo
        return OCRService(MockOCRStrategy())
    return OCRService(MockOCRStrategy())

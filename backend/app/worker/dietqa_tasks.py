import os
import instructor
from litellm import completion
from app.celery_app import celery_app
from app.schemas.dietqa import MealAnalysisResult
from loguru import logger
import json
import redis
from celery.exceptions import MaxRetriesExceededError

redis_client = redis.Redis.from_url(os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"))

@celery_app.task(
    bind=True, 
    name="analyze_meal_image",
    autoretry_for=(Exception,), 
    retry_backoff=True, 
    max_retries=3
)
def analyze_meal_image_task(self, image_url: str, patient_id: str, correlation_id: str):
    logger.info(f"Starting DietQA analysis for {patient_id} with image {image_url}")
    try:
        client = instructor.from_litellm(completion)
        
        analysis: MealAnalysisResult = client.chat.completions.create(
            model="gpt-4o",
            response_model=MealAnalysisResult,
            messages=[
                {
                    "role": "system",
                    "content": "Eres un asistente clínico de nutrición experto en inferir macronutrientes a partir de imágenes."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analiza esta imagen y detalla los componentes nutricionales. Presta especial atención si es una foto de una etiqueta comercial vs un plato casero."
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        }
                    ]
                }
            ]
        )
        
        payload = {
            "type": "DIETQA_ANALYSIS_COMPLETE",
            "patient_id": patient_id,
            "correlation_id": correlation_id,
            "data": analysis.model_dump()
        }
        redis_client.publish(f"channel:patient:{patient_id}", json.dumps(payload))
        logger.info(f"DietQA analysis successful: confidence={analysis.confidence_score}")
        
        return analysis.model_dump()
        
    except Exception as exc:
        logger.error(f"Error in analyze_meal_image_task: {str(exc)}")
        
        try:
            # Forzamos reintento manual si queremos capturar explícitamente el MaxRetriesExceededError
            # Pero autoretry_for lo hace automático. Interceptamos si la tarea ya intentó 3 veces.
            if self.request.retries >= self.max_retries:
                raise MaxRetriesExceededError()
            raise exc
        except MaxRetriesExceededError:
            # Dead Letter Queue Fallback (SSE a Nutricionista)
            logger.critical(f"DLQ: DietQA falló permanentemente tras 3 reintentos para {patient_id}")
            payload = {
                "type": "DIETQA_ANALYSIS_FAILED",
                "patient_id": patient_id,
                "correlation_id": correlation_id,
                "error": "SYSTEM_ERROR_MANUAL_REVIEW"
            }
            redis_client.publish(f"channel:patient:{patient_id}", json.dumps(payload))
            raise

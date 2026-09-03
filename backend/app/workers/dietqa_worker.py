import asyncio
from app.celery_app import celery_app
from app.domains.dietqa.service import DietQAService
from app.domains.dietqa.schemas import GeneratePlanRequest, GeneratePlanResponse
from loguru import logger

@celery_app.task(name="generate_dietary_plan_task", bind=True, max_retries=2)
def generate_dietary_plan_task(self, request_data: dict) -> dict:
    """
    Tarea en background para generar un plan asimétrico con DietQA
    basado en la ecuación Mifflin-St Jeor y prescripción de macronutrientes.
    """
    logger.info("Starting asynchronous DietQA plan generation task")
    try:
        req = GeneratePlanRequest(**request_data)
        service = DietQAService()
        
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                plan_response = pool.submit(asyncio.run, service.generate_plan(req)).result()
        else:
            plan_response = loop.run_until_complete(service.generate_plan(req))

        logger.info("DietQA plan generation task completed successfully")
        return plan_response.model_dump()
    except Exception as exc:
        logger.error(f"Error in DietQA plan generation task: {exc}")
        raise self.retry(exc=exc, countdown=10)

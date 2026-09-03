import asyncio
import base64
from typing import Any
from uuid import UUID

import httpx
import structlog
import csv
import io

from app.celery_app import celery_app
from app.services.magic_import import magic_import_service
from app.services.revenue_guard import revenue_guard_service

logger = structlog.get_logger()

@celery_app.task(bind=True, max_retries=3)
def process_csv_import_task(self, tenant_id_str: str, professional_id_str: str, csv_b64: str) -> dict[str, Any]:
    """
    Worker asíncrono para ingesta masiva (Épica A).
    Implementa csv.Sniffer, sanitización BOM y Dead Letter Queue (vía MagicImportEngine).
    """
    logger.info("csv_import_task_started", task_id=self.request.id, tenant_id=tenant_id_str)
    
    try:
        tenant_id = UUID(tenant_id_str)
        professional_id = UUID(professional_id_str) if professional_id_str else None
    except ValueError:
        logger.error("invalid_uuids_in_csv_task", tenant_id=tenant_id_str)
        raise

    # Decodificar y sanitizar BOM
    csv_bytes = base64.b64decode(csv_b64)
    csv_str = csv_bytes.decode('utf-8-sig')

    # Autodetectar delimitador
    try:
        sample = csv_str[:2048] if len(csv_str) > 2048 else csv_str
        dialect = csv.Sniffer().sniff(sample)
    except Exception:
        dialect = csv.excel # Fallback a CSV estándar

    reader = csv.DictReader(io.StringIO(csv_str), dialect=dialect)
    
    raw_records = []
    for row in reader:
        # Normalizar claves para ser case-insensitive y sin espacios extras
        clean_row = {k.strip().lower() if k else "": v for k, v in row.items()}
        
        # Mapeo desde Plantilla en español a AthleteImportSchema
        nombre_completo = clean_row.get("nombre completo", clean_row.get("first_name", ""))
        name_parts = nombre_completo.split(" ", 1)
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        record = {
            "first_name": first_name,
            "last_name": last_name or clean_row.get("last_name", ""),
            "email": clean_row.get("email", ""),
            "phone": clean_row.get("telefono", clean_row.get("phone", "")),
            "extra_data": {
                "objetivo": clean_row.get("objetivo principal", ""),
                "experiencia": clean_row.get("nivel de experiencia", ""),
                "frecuencia": clean_row.get("dias por semana", ""),
                "equipamiento": clean_row.get("equipamiento disponible", ""),
                "notas": clean_row.get("notas clinicas", "")
            }
        }
        raw_records.append(record)

    async def _run_async_insert():
        from app.db.connection import async_session_maker
        from app.services.magic_import_engine import MagicImportEngine
        
        async with async_session_maker() as db:
            engine = MagicImportEngine(db, tenant_id, professional_id)
            success, quarantine = await engine.process_batch(raw_records)
            logger.info("csv_import_completed", success=success, quarantine=quarantine)
            return {
                "status": "SUCCESS", 
                "success_count": success, 
                "quarantine_count": quarantine,
                "total_processed": len(raw_records)
            }

    return asyncio.run(_run_async_insert())


@celery_app.task(bind=True, max_retries=3)
def process_magic_import_task(self, tenant_id_str: str, image_b64: str, mime_type: str) -> dict[str, Any]:
    """
    Worker Asíncrono para abstraer la carga pesada de GPT-4o Vision.
    Implementa Garantía de Entrega, Exponential Backoff y Deducción Atómica de Créditos.
    """
    logger.info("magic_import_task_started", task_id=self.request.id, tenant_id=tenant_id_str)
    
    image_bytes = base64.b64decode(image_b64)
    
    try:
        tenant_id = UUID(tenant_id_str)
    except ValueError:
        logger.error("invalid_tenant_id", tenant_id=tenant_id_str)
        raise

    async def _run_async_extraction() -> dict[str, Any]:
        try:
            # 1. Ejecutar inferencia pesada (Libera el Event Loop de FastAPI)
            result = await magic_import_service.extract_from_image(
                image_bytes=image_bytes,
                mime_type=mime_type
            )
            
            # 2. Revenue Guard: Deducción atómica post-inferencia (FinOps)
            # Usando un proxy estándar de costo para pruebas (ej. GPT-4o Vision suele gastar ~1200 tokens)
            prompt_tokens = 800
            completion_tokens = 400
            
            await revenue_guard_service.deduct_compute_units(
                tenant_id=tenant_id,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                model_name="gpt-4o-vision"
            )
            
            # --- VIRAL ENGINE: PRUEBA DE TRABAJO Y ESCUDO ASIMÉTRICO (Phase 17) ---
            from app.tasks.reward_tasks import process_referral_reward
            logger.info("magic_import_success_firing_viral_engine", tenant_id=tenant_id_str)
            process_referral_reward.delay(tenant_id_str)
            
            # 3. Retornar modelo Pydantic volcado a diccionario JSON (serializable para Celery)
            return result.model_dump(mode="json")
            
        except httpx.NetworkError as ne:
            logger.warning("magic_import_network_error", error=str(ne))
            # Exponential Backoff: 2, 4, 8 segundos
            raise self.retry(exc=ne, countdown=2 ** self.request.retries)
        except Exception as e:
            if "RateLimitError" in str(e) or "429" in str(e):
                logger.warning("magic_import_rate_limit", error=str(e))
                raise self.retry(exc=e, countdown=2 ** self.request.retries)
            logger.error("magic_import_task_failed", error=str(e))
            raise

    # Ejecuta el scope del framework LLM en un loop asíncrono aislado sin chocar
    # con el pool de base de datos principal de uvicorn.
    return asyncio.run(_run_async_extraction())


@celery_app.task(bind=True, max_retries=2)
def analyze_feedback_task(self, message_id_str: str) -> dict[str, Any]:
    """
    Phase 15: AI Swap Engine
    Worker asíncrono que analiza el feedback del atleta, genera una sugerencia de 
    reemplazo de ejercicio usando un LLM (estructurado) y emite un evento SSE al Coach.
    """
    logger.info("analyze_feedback_task_started", task_id=self.request.id, message_id=message_id_str)
    
    try:
        message_id = UUID(message_id_str)
    except ValueError:
        logger.error("invalid_message_id", message_id=message_id_str)
        raise

    async def _run_async_analysis() -> dict[str, Any]:
        from app.db.connection import async_session_maker
        from app.db.models import Message, Client, Tenant
        from sqlalchemy import select
        from app.services.sse_manager import sse_manager
        from app.services.revenue_guard import RevenueGuardService
        import litellm
        import json
        
        # Opcional: Configurar litellm
        litellm.drop_params = True

        async with async_session_maker() as db:
            # 1. Fetch Message, Client, and Tenant
            query = select(Message).where(Message.id == message_id)
            result = await db.execute(query)
            message = result.scalar_one_or_none()
            
            if not message:
                logger.error("message_not_found", message_id=message_id_str)
                return {"status": "error", "reason": "message_not_found"}
                
            client_query = select(Client).where(Client.user_id == message.sender_id)
            client_result = await db.execute(client_query)
            client = client_result.scalar_one_or_none()
            
            if not client:
                logger.error("client_not_found_for_message", message_id=message_id_str)
                return {"status": "error", "reason": "client_not_found"}

            tenant_query = select(Tenant).where(Tenant.id == client.tenant_id)
            tenant_result = await db.execute(tenant_query)
            tenant = tenant_result.scalar_one_or_none()

            # Base SSE Payload (Fallback default without AI)
            sse_payload = {
                 "client_id": str(client.user_id),
                 "client_name": f"{client.first_name} {client.last_name}",
                 "message_id": str(message.id),
                 "content": message.content,
                 "created_at": message.created_at.isoformat()
            }

            # 2. FINOPS GUARDRAIL: Pre-check Credits
            if not tenant or tenant.compute_units_balance <= 0:
                logger.warning("tenant_out_of_compute_units", tenant_id=str(client.tenant_id), balance=tenant.compute_units_balance if tenant else 0)
                # Emitir SSE básico (sin AI) para no frenar la bandeja de entrada
                await sse_manager.broadcast_to_tenant(
                    tenant_id=client.tenant_id,
                    message_type="NEW_INBOX_EVENT",
                    payload=sse_payload
                )
                return {"status": "success", "ai_suggestion": None, "warning": "out_of_compute_units"}

            try:
                # 3. Call LLM for Exercise Replacement (Structured Output)
                ai_suggestion = None
                if message.intent_category in ["TOO_HARD", "PAIN_REPORTED", "LACK_OF_EQUIPMENT"]:
                    prompt = f"""
                    Given the following message from an athlete, suggest a replacement exercise.
                    Message: "{message.content}"
                    Intent: {message.intent_category}

                    Provide the response STRICTLY as a JSON object with the following keys:
                    - suggested_exercise_id: (string, e.g. 'exe_123_mock')
                    - suggested_exercise_name: (string)
                    - reason_short: (string)
                    Do NOT include markdown formatting or backticks around the JSON.
                    """

                    # Execute LLM via litellm
                    response = await litellm.acompletion(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.0
                    )

                    # Extract Tokens natively (FINOPS)
                    prompt_tokens = response.usage.prompt_tokens
                    completion_tokens = response.usage.completion_tokens
                    total_tokens = prompt_tokens + completion_tokens

                    # Parse output
                    res_content = response.choices[0].message.content
                    try:
                        ai_suggestion = json.loads(res_content)
                        sse_payload["ai_suggestion"] = ai_suggestion
                        logger.info("ai_suggestion_generated", message_id=message_id_str, suggestion=ai_suggestion, total_tokens=total_tokens)
                    except json.JSONDecodeError:
                        logger.error("ai_json_parse_failed", raw_content=res_content)
                    
                    # 4. FINOPS ATOMIC DEDUCTION
                    rg_service = RevenueGuardService()
                    await rg_service.deduct_compute_units(
                        db=db,
                        tenant_id=client.tenant_id,
                        total_units=total_tokens,
                        reference=f"llm_swap_engine:msg:{message_id_str}"
                    )
                    logger.info("tokens_deducted", tenant_id=str(client.tenant_id), amount=total_tokens)

                # 5. Emit SSE Event via Redis/ConnectionManager to Coach
                await sse_manager.broadcast_to_tenant(
                    tenant_id=client.tenant_id,
                    message_type="NEW_INBOX_EVENT",
                    payload=sse_payload
                )
                
                return {"status": "success", "ai_suggestion": ai_suggestion}

            except Exception as e:
                logger.error("llm_analysis_failed", message_id=message_id_str, error=str(e))
                # Fallback: still emit the SSE without AI suggestion to ensure delivery
                await sse_manager.broadcast_to_tenant(
                    tenant_id=client.tenant_id,
                    message_type="NEW_INBOX_EVENT",
                    payload=sse_payload
                )
                raise self.retry(exc=e, countdown=5)

    return asyncio.run(_run_async_analysis())

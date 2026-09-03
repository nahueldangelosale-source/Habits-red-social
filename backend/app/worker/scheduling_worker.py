from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_reservation_confirmation(self, reservation_id: str, user_id: str):
    """
    Simula el envío de un correo electrónico o notificación PUSH de confirmación de reserva.
    Offloading de efectos secundarios para no bloquear el request sincrónico.
    """
    try:
        logger.info(f"Enviando confirmación de reserva {reservation_id} al usuario {user_id}")
        # Aquí iría la lógica de integración con un servicio de email (SendGrid, AWS SES) o Firebase
        # ...
        return {"status": "success", "reservation_id": reservation_id}
    except Exception as exc:
        logger.error(f"Error al enviar confirmación de reserva {reservation_id}: {str(exc)}")
        raise self.retry(exc=exc, countdown=10)

@shared_task(bind=True, max_retries=3)
def sync_reservation_to_analytics(self, reservation_id: str):
    """
    Envía el evento de reserva al data warehouse o sistema de analytics.
    """
    try:
        logger.info(f"Sincronizando reserva {reservation_id} con Analytics")
        # Aquí iría la lógica de envío de evento (ej. Segment, Mixpanel, o DB interna)
        # ...
        return {"status": "success", "reservation_id": reservation_id}
    except Exception as exc:
        logger.error(f"Error al sincronizar reserva {reservation_id} con Analytics: {str(exc)}")
        raise self.retry(exc=exc, countdown=10)

@shared_task(bind=True, max_retries=3)
def athlete_attended_task(self, user_id: str, tenant_id: str):
    """
    Evento Event-Driven: Resetea el contador de inactividad del Churn Risk Index (CRI).
    Interactúa con Redis DB 1 para modificar la predicción de fuga en tiempo real.
    """
    import asyncio
    from datetime import datetime, timezone
    from app.services.redis_client import get_redis

    async def _update_redis():
        redis = await get_redis()
        now = datetime.now(timezone.utc).isoformat()
        pipe = redis.pipeline()
        pipe.set(f"cri:{tenant_id}:{user_id}:last_attendance", now)
        pipe.incr(f"cri:{tenant_id}:{user_id}:consecutive_attendances")
        await pipe.execute()

    try:
        logger.info(f"[Attendance Engine] Procesando Attended para user {user_id}. Reseteando CRI.")
        loop = asyncio.get_event_loop()
        loop.run_until_complete(_update_redis())
        return {"status": "success", "event": "AthleteAttended", "user_id": user_id}
    except Exception as exc:
        logger.error(f"Error procesando AthleteAttended para {user_id}: {str(exc)}")
        raise self.retry(exc=exc, countdown=5)

@shared_task(bind=True, max_retries=3)
def athlete_noshow_task(self, reservation_id: str, user_id: str, tenant_id: str):
    """
    Evento Event-Driven: Dispara alerta temprana al Watchtower del entrenador por inasistencia.
    """
    import asyncio
    from app.services.redis_client import get_redis

    async def _update_redis():
        redis = await get_redis()
        pipe = redis.pipeline()
        pipe.set(f"cri:{tenant_id}:{user_id}:consecutive_attendances", 0)
        pipe.incr(f"cri:{tenant_id}:{user_id}:recent_no_shows")
        await pipe.execute()

    try:
        logger.info(f"[Attendance Engine] Procesando No-Show. Alerta para reservation {reservation_id}")
        loop = asyncio.get_event_loop()
        loop.run_until_complete(_update_redis())
        return {"status": "success", "event": "AthleteNoShow", "reservation_id": reservation_id}
    except Exception as exc:
        logger.error(f"Error procesando AthleteNoShow para {reservation_id}: {str(exc)}")
        raise self.retry(exc=exc, countdown=5)

@shared_task(bind=True)
def sweep_no_shows(self):
    """
    Cron Job Nocturno: Barre la BD buscando reservas pasadas en estado BOOKED
    y las muta atómicamente a NO_SHOW, disparando las alertas pertinentes.
    """
    from app.db.connection import get_db
    from app.domain.scheduling.models import Reservation
    from sqlalchemy import select, update
    from datetime import datetime, timezone
    import asyncio
    
    logger.info("[Attendance Engine] Iniciando sweep_no_shows...")
    
    async def _run_sweep():
        gen = get_db()
        db = await gen.__anext__()
        try:
            now = datetime.now(timezone.utc)
            # 1. Encontrar reservas vencidas en BOOKED
            # Ojo: Requiere join con ClassSession para ver start_time o end_time. 
            # Por simplicidad aquí, supongamos que actualizamos reservas cuya ClassSession.end_time < now
            # (El query real dependería de los relationships, usaremos SQL puro o el modelo)
            from app.domain.scheduling.models import ClassSession
            from app.db.models import Client
            from app.config import get_settings
            from sqlalchemy import not_
            
            # Buscar las IDs de las reservas a marcar como NO_SHOW
            stmt_select = (
                select(Reservation.id, Reservation.user_id, ClassSession.tenant_id)
                .join(ClassSession, Reservation.session_id == ClassSession.id)
                .join(Client, Reservation.user_id == Client.id)
                .where(
                    Reservation.status == "BOOKED",
                    ClassSession.end_time < now
                )
            )
            settings = get_settings()
            if settings.ff_exclude_ghost_athletes:
                stmt_select = stmt_select.where(not_(Client.extra_data.contains({"is_ghost_persona": True})))
                
            stmt_select = stmt_select.with_for_update(skip_locked=True)
            result = await db.execute(stmt_select)
            stale_reservations = result.fetchall()
            
            if not stale_reservations:
                logger.info("[Attendance Engine] No hay reservas stale para marcar como NO_SHOW.")
                return 0
                
            stale_ids = [r.id for r in stale_reservations]
            
            # 2. Update atómico masivo
            stmt_update = (
                update(Reservation)
                .where(Reservation.id.in_(stale_ids))
                .values(status="NO_SHOW")
            )
            await db.execute(stmt_update)
            await db.commit()
            
            # 3. Disparar Eventos Celery
            for row in stale_reservations:
                athlete_noshow_task.delay(str(row.id), str(row.user_id), str(row.tenant_id))
                
            logger.info(f"[Attendance Engine] Sweep completado. {len(stale_ids)} reservas marcadas como NO_SHOW.")
            return len(stale_ids)
        finally:
            await gen.aclose()
            
    # Ejecutamos la corutina en el event loop sincrónico de Celery
    loop = asyncio.get_event_loop()
    updated_count = loop.run_until_complete(_run_sweep())
    return {"status": "success", "updated_count": updated_count}

@shared_task(bind=True)
def process_churn_risk_evaluation(self):
    """
    Cron Job Nocturno (Fase 46): Evalúa el CRI de todos los atletas.
    Persiste el histórico inmutable en ChurnRiskScore y, si se supera el umbral
    y NO hay un periodo de enfriamiento (Cooldown) activo, emite una ActionCard.
    """
    from app.db.connection import get_db
    from app.db.models import Client, Tenant
    from app.domain.watchtower.models import ActionCard, ChurnRiskScore, ActionCardStatus
    from app.domain.watchtower.cri_engine import calculate_cri, AthleteStats
    from app.domain.watchtower.message_generator import MessageGenerator
    from app.services.redis_client import get_redis
    from app.config import get_settings
    from sqlalchemy import select, or_, not_
    from datetime import datetime, timedelta, timezone
    import asyncio
    import uuid
    
    logger.info("[Watchtower] Iniciando evaluación global de Churn Risk Index (CRI)...")
    
    async def _evaluate():
        gen = get_db()
        db = await gen.__anext__()
        redis = await get_redis()
        try:
            # 1. Obtener inquilinos activos y sus atletas reales desde PostgreSQL
            tenants_result = await db.execute(select(Tenant.id))
            tenant_ids = tenants_result.scalars().all()
            
            cards_created = 0
            cooldown_limit = datetime.utcnow() - timedelta(hours=48)
            now = datetime.now(timezone.utc)
            
            for tenant_id in tenant_ids:
                # 1. Obtener atletas activos para este tenant
                stmt = select(Client).where(Client.tenant_id == tenant_id)
                settings = get_settings()
                if settings.ff_exclude_ghost_athletes:
                    stmt = stmt.where(not_(Client.extra_data.contains({"is_ghost_persona": True})))
                    
                athletes_result = await db.execute(stmt)
                active_athletes = athletes_result.scalars().all()
                
                if not active_athletes:
                    continue

                # 2. Hidratar métricas calientes desde Redis en un solo Pipeline masivo
                pipe = redis.pipeline()
                for athlete in active_athletes:
                    pipe.get(f"cri:{tenant_id}:{athlete.id}:last_attendance")
                    pipe.get(f"cri:{tenant_id}:{athlete.id}:consecutive_attendances")
                    pipe.get(f"cri:{tenant_id}:{athlete.id}:recent_no_shows")
                
                redis_results = await pipe.execute()
                
                # 3. Correr el Math Engine con datos 100% reales
                for i, athlete in enumerate(active_athletes):
                    # Indices en redis_results: 0,1,2 for first athlete, 3,4,5 for second, etc.
                    last_attendance_str = redis_results[i * 3]
                    consecutive_attendances = int(redis_results[i * 3 + 1] or 0)
                    recent_no_shows = int(redis_results[i * 3 + 2] or 0)
                    
                    days_since_last_attendance = 0
                    if last_attendance_str:
                        last_attendance = datetime.fromisoformat(last_attendance_str)
                        days_since_last_attendance = (now - last_attendance).days
                    else:
                        # Si nunca asistió o no hay registro, asignar alto riesgo por defecto temporal
                        days_since_last_attendance = 30
                        
                    # Simulamos attendance_rate_14d o calculamos desde historial si fuera necesario
                    # Por simplicidad en este pipeline asumiremos 0.0 si no vino, 1.0 si no faltó
                    attendance_rate_14d = 1.0 if recent_no_shows == 0 else 0.5
                    
                    stats = AthleteStats(
                        days_since_last_attendance=days_since_last_attendance,
                        recent_no_shows=recent_no_shows,
                        attendance_rate_14d=attendance_rate_14d,
                        consecutive_attendances=consecutive_attendances
                    )
                    
                    context = {
                        "nombre": athlete.first_name,
                        "dias_inactivos": days_since_last_attendance,
                        "clase": "Cross Training" # Mock info, a robust implementation would join ClassSession
                    }
                    
                    # A. Calcular Score (cri_engine.py puramente funcional)
                    score = calculate_cri(stats)
                    
                    # B. ¿Score > Umbral de Intervención? (Ej. 60)
                    if score >= 60:
                        # C. Query: Buscar ActionCard de cooldown
                        stmt = select(ActionCard).where(
                            ActionCard.athlete_id == athlete.id,
                            or_(
                                ActionCard.status == ActionCardStatus.PENDING,
                                ActionCard.created_at >= cooldown_limit
                            )
                        )
                        result = await db.execute(stmt)
                        existing_card = result.scalars().first()
                        
                        if existing_card:
                            logger.info(f"[Watchtower] Cooldown activo para atleta {athlete.id}. Ignorando tarjeta.")
                            db.add(ChurnRiskScore(athlete_id=athlete.id, tenant_id=tenant_id, score=score))
                        else:
                            # D. Sin Cooldown: Persistir y Generar Tarjeta
                            new_score_record = ChurnRiskScore(athlete_id=athlete.id, tenant_id=tenant_id, score=score)
                            db.add(new_score_record)
                            await db.flush() # Para obtener el ID del score
                            
                            payload = MessageGenerator.generate_intervention_payload(score, context)
                            
                            new_card = ActionCard(
                                tenant_id=tenant_id,
                                professional_id=athlete.professional_id,
                                athlete_id=athlete.id,
                                risk_score_id=new_score_record.id,
                                title=payload.title,
                                body_template=payload.body_template,
                                context_variables=payload.context_variables,
                                status=ActionCardStatus.PENDING
                            )
                            db.add(new_card)
                            cards_created += 1
                            logger.info(f"[Watchtower] Generada nueva ActionCard para atleta {athlete.id} con CRI={score}.")
                    else:
                        db.add(ChurnRiskScore(athlete_id=athlete.id, tenant_id=tenant_id, score=score))
                        
            await db.commit()
            return cards_created
            
        finally:
            await gen.aclose()

    loop = asyncio.get_event_loop()
    cards_created = loop.run_until_complete(_evaluate())
    return {"status": "success", "action_cards_generated": cards_created}

@shared_task(bind=True, max_retries=3)
def expire_waitlist_offer(self, reservation_id: str):
    """
    Expirar la oferta de lista de espera si no fue confirmada.
    """
    import asyncio
    from sqlalchemy.future import select
    from app.db.database import get_db
    from app.domain.scheduling.models import Reservation
    from app.domain.scheduling.service import SchedulingService

    async def _expire():
        gen = get_db()
        db = await gen.__anext__()
        try:
            query = select(Reservation).where(Reservation.id == reservation_id)
            res = await db.execute(query)
            reservation = res.scalars().first()

            if not reservation:
                return

            if reservation.status == "OFFERED":
                # Aún no confirmó, expiramos
                reservation.status = "EXPIRED"
                await db.commit()
                
                # Promover al siguiente usando SchedulingService.cancel_reservation logic, pero desde el contexto de expiración.
                # Para evitar duplicar lógica, podemos simplemente disparar una cancelación ficticia o usar un método auxiliar.
                # Aquí, simularemos la promoción del siguiente.
                service = SchedulingService(db)
                tenant_id = str(reservation.tenant_id) if hasattr(reservation, 'tenant_id') else None
                if not tenant_id:
                    # fetch via session
                    from app.domain.scheduling.models import ClassSession
                    sess_res = await db.execute(select(ClassSession).where(ClassSession.id == reservation.session_id))
                    sess = sess_res.scalars().first()
                    tenant_id = str(sess.tenant_id)
                
                # Call cancel logic manually to promote next
                try:
                    result = await service.cancel_reservation(str(reservation.id), tenant_id)
                    if result and result.get("promoted_reservation_id"):
                        expire_waitlist_offer.apply_async((result["promoted_reservation_id"],), countdown=900)
                except Exception as e:
                    logger.error(f"Error promoting next waitlist after expiration: {e}")
                    
        finally:
            await gen.aclose()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(_expire())


@shared_task(bind=True, max_retries=3)
def persist_attendance_event(self, athlete_id: str, tenant_id: str, timestamp: str):
    """
    Phase 54: Bank-Grade Audit Vault Persistence
    Writes the 'streak_ignited' check-in telemetry to the time-series partitioned M2MAuditVault.
    On database lock timeout or failure, routes the event to the Postgres DLQ (FailedAuditJob).
    """
    import asyncio
    import traceback
    from sqlalchemy.exc import DBAPIError, OperationalError
    from app.db.session import get_db_session
    from app.db.models import M2MAuditVault, FailedAuditJob
    import uuid
    from datetime import datetime
    
    async def _persist():
        # Because worker is synchronous/Celery standard, we use asyncio.run or we use sync SQLAlchemy.
        # This project uses async SQLAlchemy (AsyncSession). We must wrap it in an event loop.
        gen = get_db_session()
        db = await gen.__anext__()
        try:
            payload = {
                "source": "reception_scanner",
                "ui_trigger": "streak_ignited",
                "tenant_id": tenant_id
            }
            
            # 1. Attempt to insert into the partitioned vault
            vault_entry = M2MAuditVault(
                client_id=uuid.UUID(athlete_id),
                event_type="attendance_check_in",
                payload=payload,
                # Forcing created_at to the given timestamp so Postgres routes it to the exact partition
                created_at=datetime.fromisoformat(timestamp.replace("Z", "+00:00")) if "Z" in timestamp else datetime.fromisoformat(timestamp)
            )
            db.add(vault_entry)
            await db.commit()
            logger.info(f"Attendance event persisted in M2MAuditVault for athlete {athlete_id}")
            
        except (DBAPIError, OperationalError, Exception) as e:
            await db.rollback()
            stack_trace = traceback.format_exc()
            logger.error(f"Failed to insert attendance into Vault. Routing to DLQ. Error: {e}")
            
            # 2. Fallback to Inverse Outbox / DLQ
            dlq_entry = FailedAuditJob(
                original_payload={
                    "athlete_id": athlete_id,
                    "tenant_id": tenant_id,
                    "timestamp": timestamp,
                    "event_type": "attendance_check_in"
                },
                error_reason=str(e)[:1000], # Trucate just in case
                status="PENDING"
            )
            db.add(dlq_entry)
            await db.commit()
            logger.info(f"Failed event routed to FailedAuditJob for athlete {athlete_id}")
        finally:
            await gen.aclose()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(_persist())

@shared_task(bind=True, name="scheduling_worker.sweep_stale_conflicts")
def sweep_stale_conflicts(self):
    """
    CRON TASK (Phase 65.1: Conflict TTL Policy)
    Busca los ActiveWorkoutPlan en estado 'CONFLICT_PENDING' que superen los 7 días
    sin resolución, y los mueve a 'ARCHIVED' reteniendo la mutación local.
    """
    from app.db.connection import engine
    from sqlalchemy import text
    import asyncio
    import traceback
    
    logger.info("sweep_stale_conflicts_started")

    async def execute_sweep():
        async with engine.connect() as conn:
            # 7-day TTL
            stmt = text("""
                UPDATE active_workout_plans
                SET status = 'ARCHIVED', updated_at = NOW()
                WHERE status = 'CONFLICT_PENDING'
                  AND conflict_detected_at < NOW() - INTERVAL '7 days'
                RETURNING id
            """)
            result = await conn.execute(stmt)
            await conn.commit()
            return len(result.fetchall())

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        archived_count = loop.run_until_complete(execute_sweep())
        logger.info("sweep_stale_conflicts_completed", archived_count=archived_count)
        return {"status": "SUCCESS", "archived_conflicts": archived_count}
    except Exception as exc:
        logger.error("sweep_stale_conflicts_error", error=str(exc))
        raise self.retry(exc=exc, countdown=60)
    finally:
        loop.close()

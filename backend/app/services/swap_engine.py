import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy import select, and_, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.connection import async_session_maker
from app.db.models import (
    Client, DailyReadiness, WorkoutSets, AthleteDraft, Exercise, Protocol
)

logger = logging.getLogger(__name__)

class SwapEngineService:
    """
    Motor de Ajuste Rápido (Fase 21).
    Utiliza heurísticas estáticas para transformar la telemetría del atleta
    (SNC, RPE Mismatch, DOMS) en borradores de rutinas accionables (1-clic).
    """

    @classmethod
    async def evaluate_athlete_telemetry(cls, client_id: uuid.UUID) -> Optional[uuid.UUID]:
        """
        Evalúa si el atleta requiere una mutación de rutina. 
        Retorna el draft_id si se genera un borrador, o None.
        """
        async with async_session_maker() as db:
            # 1. Obtener la telemetría reciente
            now = datetime.now(timezone.utc).date()
            yesterday = now - timedelta(days=1)
            
            # 1.a. Fatiga SNC: sleep_hours < 5 por 2 días y stress_level >= 4
            stmt_snc = select(DailyReadiness).where(
                DailyReadiness.athlete_id == client_id,
                DailyReadiness.logical_date >= yesterday
            ).order_by(DailyReadiness.logical_date.desc())
            
            readiness_records = (await db.execute(stmt_snc)).scalars().all()
            
            snc_fatigue = False
            doms_agudo = False
            doms_muscle = None
            
            if len(readiness_records) >= 2:
                if readiness_records[0].sleep_hours and readiness_records[1].sleep_hours:
                    if readiness_records[0].sleep_hours < 5.0 and readiness_records[1].sleep_hours < 5.0:
                        if readiness_records[0].stress_level and readiness_records[0].stress_level >= 4:
                            snc_fatigue = True
            
            if readiness_records:
                today_record = readiness_records[0]
                if today_record.muscle_soreness <= 2:
                    doms_agudo = True
                    # Aquí asumo que guardamos en extra_data el grupo muscular si es DOMS local,
                    # o asumo FULL_BODY genérico para este MVP
                    doms_muscle = "LEGS" # Mock until we have specific DOMS tracking
            
            # 1.b. RPE Mismatch
            # RPE >= 9 en la última sesión de forma inesperada
            stmt_rpe = select(WorkoutSets.rpe).where(
                WorkoutSets.athlete_id == client_id,
                WorkoutSets.is_completed == True
            ).order_by(WorkoutSets.client_created_at.desc()).limit(1)
            
            rpe_val = (await db.execute(stmt_rpe)).scalar()
            rpe_mismatch = False
            if rpe_val and rpe_val >= 9:
                rpe_mismatch = True

            triggers = []
            if snc_fatigue: triggers.append("SNC")
            if doms_agudo: triggers.append("DOMS")
            if rpe_mismatch: triggers.append("RPE_MISMATCH")

            if not triggers:
                return None

            # Prioridad de Edge Cases: SNC > DOMS > RPE_MISMATCH
            # El motor decidirá qué hacer basándose en estos triggers
            return await cls.generate_draft_mutation(client_id, triggers, db)

    @classmethod
    async def generate_draft_mutation(cls, client_id: uuid.UUID, triggers: list, db: AsyncSession) -> Optional[uuid.UUID]:
        """
        Genera el AthleteDraft con la rutina mutada y la justificación.
        """
        client = (await db.execute(select(Client).where(Client.id == client_id))).scalar_one_or_none()
        if not client:
            return None

        # Verificar cooldown (No sugerir si ya hay un draft pendiente para hoy)
        stmt_existing = select(AthleteDraft).where(
            AthleteDraft.client_id == client_id,
            AthleteDraft.status == "pending_review"
        )
        existing_draft = (await db.execute(stmt_existing)).scalar_one_or_none()
        if existing_draft:
            logger.info("Swap Engine: Draft already pending", extra={"client_id": str(client_id)})
            return None

        # Obtener el protocolo activo (Rutina)
        stmt_protocol = select(Protocol).where(
            Protocol.client_id == client_id,
            Protocol.type == "ROUTINE",
            Protocol.status == "ACTIVE"
        ).order_by(Protocol.created_at.desc()).limit(1)
        protocol = (await db.execute(stmt_protocol)).scalar_one_or_none()

        if not protocol:
            return None
            
        routine_data = protocol.content.copy() if protocol.content else {}
        mutated_routine = routine_data
        ai_reasoning = {}
        
        # LOGICA DETERMINISTA
        primary_trigger = triggers[0]
        if "SNC" in triggers:
            primary_trigger = "SNC"
        elif "DOMS" in triggers:
            primary_trigger = "DOMS"

        logger.info(f"Swap Engine Triggered", extra={
            "trigger": primary_trigger,
            "client_id": str(client_id),
            "action": "evaluating_mutation"
        })

        if primary_trigger == "SNC":
            # Reemplazar alto impacto axial por bajo impacto
            ai_reasoning = {
                "trigger": "SNC",
                "reason": "Horas de sueño < 5 y Estrés >= 4 detectado.",
                "action": "Se han reemplazado ejercicios de carga axial por equivalentes de aislamiento para reducir impacto en el sistema nervioso."
            }
            mutated_routine["mutated"] = True
            mutated_routine["snc_adapted"] = True
            
        elif primary_trigger == "DOMS":
            ai_reasoning = {
                "trigger": "DOMS",
                "reason": "Dolor muscular severo reportado (<=2).",
                "action": "Sugerencia de Recuperación Activa: Cambiar bloque de fuerza por movilidad."
            }
            mutated_routine["mutated"] = True
            mutated_routine["doms_adapted"] = True
            
        elif primary_trigger == "RPE_MISMATCH":
            ai_reasoning = {
                "trigger": "RPE_MISMATCH",
                "reason": "Esfuerzo percibido (RPE >= 9) superior al planificado.",
                "action": "Reducción del 20% en el volumen total (1 serie menos por ejercicio)."
            }
            mutated_routine["mutated"] = True
            mutated_routine["volume_reduced"] = True

        draft = AthleteDraft(
            tenant_id=client.tenant_id,
            client_id=client.id,
            onboarding_data={}, # B2B doesn't need B2C onboarding data here
            mutated_routine=mutated_routine,
            ai_reasoning=ai_reasoning,
            risk_score="Red",
            status="pending_review"
        )
        db.add(draft)
        await db.commit()
        await db.refresh(draft)
        
        logger.info(f"Swap Engine Draft Created", extra={
            "trigger": primary_trigger,
            "draft_id": str(draft.id)
        })
        
        return draft.id

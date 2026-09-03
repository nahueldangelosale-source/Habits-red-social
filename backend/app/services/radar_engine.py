import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple
from sqlalchemy import select, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.db.models import Client, WorkoutSession, TelemetryAlert
from app.services.acwr_service import acwr_service

logger = structlog.get_logger()

class RadarEngine:
    """
    Motor del Radar Predictivo y Telemetría Biomecánica.
    Computa el riesgo de abandono (Churn) e inactividad, y fatiga del SNC (ACWR EWMA),
    persitiendo y actualizando las alertas en la tabla telemetry_alerts de forma asíncrona.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def run_analytics_for_tenant(self, tenant_id: uuid.UUID) -> Tuple[int, int]:
        """
        Ejecuta el análisis predictivo para todos los clientes activos de un tenant.
        Retorna (alerts_created, alerts_resolved).
        """
        logger.info("running_radar_analytics_for_tenant", tenant_id=str(tenant_id))
        
        # Obtener todos los clientes activos del tenant
        stmt = select(Client).where(and_(Client.tenant_id == tenant_id, Client.is_active == True))
        result = await self.db.execute(stmt)
        clients = result.scalars().all()
        
        alerts_created = 0
        alerts_resolved = 0

        for client in clients:
            # 1. Analizar Biomecánica (ACWR EWMA)
            acwr_result = await acwr_service.calculate_client_acwr(client.id, self.db)
            acwr_ratio = acwr_result.get("acwr", 0.0)
            
            # 2. Analizar Inactividad (Churn)
            workout_stmt = (
                select(WorkoutSession)
                .where(WorkoutSession.client_id == client.id)
                .order_by(WorkoutSession.started_at.desc())
                .limit(1)
            )
            workout_res = await self.db.execute(workout_stmt)
            latest_workout = workout_res.scalar_one_or_none()
            
            if latest_workout:
                days_inactive = (datetime.utcnow() - latest_workout.started_at).days
            else:
                days_inactive = 30 # Default if they never trained
            
            # -- Procesar Alerta de Fatiga (ACWR) --
            if acwr_ratio >= 1.5:
                severity = "danger"
                msg = f"Riesgo crítico de sobreentrenamiento: ACWR alcanzó {acwr_ratio:.2f} (Danger Zone). Riesgo de lesión inminente."
                created = await self._upsert_alert(tenant_id, client.id, "fatigue_acwr", severity, "acwr_ratio", acwr_ratio, msg)
                if created: alerts_created += 1
            elif acwr_ratio >= 1.2:
                severity = "warning"
                msg = f"Carga aguda elevada: ACWR es {acwr_ratio:.2f}. Fatiga del SNC en aumento."
                created = await self._upsert_alert(tenant_id, client.id, "fatigue_acwr", severity, "acwr_ratio", acwr_ratio, msg)
                if created: alerts_created += 1
            else:
                # Si el ACWR bajó a la zona segura, auto-resolver alerta existente
                resolved = await self._auto_resolve_alert(client.id, "fatigue_acwr")
                if resolved: alerts_resolved += 1

            # -- Procesar Alerta de Inactividad (Churn) --
            if days_inactive > 14:
                severity = "danger"
                msg = f"Riesgo extremo de Churn silencioso: {days_inactive} días sin registrar actividad física."
                created = await self._upsert_alert(tenant_id, client.id, "churn", severity, "days_since_last_workout", float(days_inactive), msg)
                if created: alerts_created += 1
            elif days_inactive > 7:
                severity = "warning"
                msg = f"Alerta de retención: {days_inactive} días de inactividad registrados."
                created = await self._upsert_alert(tenant_id, client.id, "churn", severity, "days_since_last_workout", float(days_inactive), msg)
                if created: alerts_created += 1
            else:
                # Si volvieron a entrenar, auto-resolver la alerta de inactividad
                resolved = await self._auto_resolve_alert(client.id, "churn")
                if resolved: alerts_resolved += 1

        # Confirmar todos los cambios
        await self.db.commit()
        return alerts_created, alerts_resolved

    async def _upsert_alert(
        self, tenant_id: uuid.UUID, client_id: uuid.UUID, alert_type: str, 
        severity: str, metric_name: str, metric_value: float, message: str
    ) -> bool:
        """
        Inserta una alerta si no existe, o la actualiza si ya existe una pendiente.
        Retorna True si es una alerta nueva.
        """
        stmt = select(TelemetryAlert).where(
            and_(
                TelemetryAlert.client_id == client_id,
                TelemetryAlert.alert_type == alert_type,
                TelemetryAlert.status == "pending"
            )
        )
        res = await self.db.execute(stmt)
        existing = res.scalar_one_or_none()
        
        if existing:
            # Actualizar alerta existente para mantener el historial vivo y evitar spam de filas
            existing.severity = severity
            existing.metric_value = metric_value
            existing.message = message
            existing.updated_at = datetime.utcnow()
            self.db.add(existing)
            return False
        else:
            # Crear nueva alerta soberana
            new_alert = TelemetryAlert(
                tenant_id=tenant_id,
                client_id=client_id,
                alert_type=alert_type,
                severity=severity,
                metric_name=metric_name,
                metric_value=metric_value,
                message=message,
                status="pending"
            )
            self.db.add(new_alert)
            return True

    async def _auto_resolve_alert(self, client_id: uuid.UUID, alert_type: str) -> bool:
        """
        Auto-resuelve (marca como dismissed) una alerta pendiente si el cliente ya no está en zona de riesgo.
        """
        stmt = select(TelemetryAlert).where(
            and_(
                TelemetryAlert.client_id == client_id,
                TelemetryAlert.alert_type == alert_type,
                TelemetryAlert.status == "pending"
            )
        )
        res = await self.db.execute(stmt)
        existing = res.scalar_one_or_none()
        
        if existing:
            existing.status = "dismissed"
            existing.resolved_at = datetime.utcnow()
            self.db.add(existing)
            logger.info("auto_resolved_radar_alert", client_id=str(client_id), alert_type=alert_type)
            return True
        return False

    async def action_alert(self, alert_id: uuid.UUID) -> bool:
        """
        Marca la alerta como accionada por el Head Coach.
        """
        stmt = select(TelemetryAlert).where(TelemetryAlert.id == alert_id)
        res = await self.db.execute(stmt)
        alert = res.scalar_one_or_none()
        
        if alert:
            alert.status = "actioned"
            alert.resolved_at = datetime.utcnow()
            self.db.add(alert)
            await self.db.commit()
            return True
        return False

    async def dismiss_alert(self, alert_id: uuid.UUID) -> bool:
        """
        Descarta la alerta de forma manual (Dismiss / Swipe).
        """
        stmt = select(TelemetryAlert).where(TelemetryAlert.id == alert_id)
        res = await self.db.execute(stmt)
        alert = res.scalar_one_or_none()
        
        if alert:
            alert.status = "dismissed"
            alert.resolved_at = datetime.utcnow()
            self.db.add(alert)
            await self.db.commit()
            return True
        return False

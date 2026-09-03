import time
import json
import structlog
from app.celery_app import celery_app

logger = structlog.get_logger()

@celery_app.task(bind=True, name="athlete.calculate_acwr_and_readiness")
def calculate_acwr_and_readiness_task(self, athlete_id: str, new_session_srpe: float) -> dict:
    """
    MOTOR DE TELEMETRÍA Y AUTORREGULACIÓN (CELERY EVENT SOURCING)
    Calcula el Acute:Chronic Workload Ratio (ACWR) usando promedios móviles exponenciales (EWMA).
    Genera alertas de sobreentrenamiento si ACWR > 1.50.
    """
    logger.info("calculate_acwr_started", task_id=self.request.id, athlete_id=athlete_id, srpe=new_session_srpe)

    # Simula el procesamiento de datos del Data Warehouse o base de datos de telemetría (Proof of Work)
    time.sleep(2)

    # MOCK EWMA CALCULATION (Valores hardcodeados simulando query a los últimos 28 días)
    # ACWR = Carga Aguda (EWMA 7 días) / Carga Crónica (EWMA 28 días)
    # Ejemplo ficticio: Un salto drástico en la carga
    chronic_load_ewma_28 = 1500.0  # sRPE promedio acumulado crónico
    acute_load_ewma_7 = 2400.0     # sRPE de esta última agresiva semana
    
    # Adding the new session
    alpha_acute = 2 / (7 + 1)
    alpha_chronic = 2 / (28 + 1)
    
    new_acute = (new_session_srpe * alpha_acute) + (acute_load_ewma_7 * (1 - alpha_acute))
    new_chronic = (new_session_srpe * alpha_chronic) + (chronic_load_ewma_28 * (1 - alpha_chronic))
    
    acwr = new_acute / new_chronic if new_chronic > 0 else 0

    alert_triggered = acwr > 1.50
    alert_payload = None

    if alert_triggered:
        alert_payload = {
            "type": "RED_FLAG",
            "metric": "ACWR_SPIKE",
            "athlete_id": athlete_id,
            "value": round(acwr, 2),
            "threshold": 1.50,
            "message": f"🔥 Alerta de Sobreentrenamiento: El ACWR (EWMA) alcanzó {acwr:.2f}. Riesgo de lesión inminente. Reduzca la carga del próximo microciclo."
            # In a real system, this payload would be published to Redis/Kafka,
            # or directly pushed to the 'IntelligentInboxWidget' via Websocket/Turso local DB.
        }
        logger.warning("acwr_limit_exceeded", athlete_id=athlete_id, acwr=acwr)

    result = {
        "status": "SUCCESS",
        "result": {
             "athlete_id": athlete_id,
             "acwr": round(acwr, 2),
             "acute_load": round(new_acute, 2),
             "chronic_load": round(new_chronic, 2),
             "readiness_score": max(0, 100 - ((acwr - 1.0) * 100)) if acwr > 1 else 100,
             "alert": alert_payload
        }
    }

    logger.info("calculate_acwr_completed", task_id=self.request.id, alert_triggered=alert_triggered)
    return result

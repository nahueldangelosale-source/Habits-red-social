from uuid import UUID
from app.celery_app import celery_app
from app.domain.watchtower.cri_engine import AthleteStats, calculate_cri
from loguru import logger

@celery_app.task(name="recalculate_cri_task", bind=True, max_retries=3)
def recalculate_cri_task(
    self, 
    athlete_id: str, 
    days_since_last_attendance: int, 
    recent_no_shows: int, 
    attendance_rate_14d: float, 
    consecutive_attendances: int = 0
) -> int:
    """
    Calcula de forma asíncrona el Churn Risk Index (CRI) de un atleta
    y emite telemetría hacia Watchtower.
    """
    logger.info(f"Recalculating CRI for athlete {athlete_id}")
    stats = AthleteStats(
        days_since_last_attendance=days_since_last_attendance,
        recent_no_shows=recent_no_shows,
        attendance_rate_14d=attendance_rate_14d,
        consecutive_attendances=consecutive_attendances
    )
    score = calculate_cri(stats)
    logger.info(f"CRI calculated for athlete {athlete_id}: score={score}")
    return score

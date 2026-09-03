from celery import shared_task
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

from app.db.connection import SessionLocal
from app.db.models import Patient

logger = get_task_logger(__name__)

# Mock methods for ACWR and Adherence. In a real scenario, these would fetch from AthleteStats/AthleteCRISnapshot
def get_athlete_acwr(patient: Patient) -> float:
    # TODO: Fetch from actual biometrics/training stats
    return patient.extra_data.get("acwr", 1.0)

def get_athlete_pain_level(patient: Patient) -> int:
    # TODO: Fetch from actual recent check-ins
    return patient.extra_data.get("pain_level", 0)

def get_days_inactive(patient: Patient) -> int:
    # TODO: Calculate from last attendance
    last_attendance_str = patient.extra_data.get("last_attendance")
    if last_attendance_str:
        try:
            last_att = datetime.fromisoformat(last_attendance_str.replace("Z", "+00:00"))
            return (datetime.now(timezone.utc) - last_att).days
        except Exception:
            return 0
    return 0

def get_athlete_adherence(patient: Patient) -> float:
    # TODO: Fetch from actual adherence metrics
    return patient.extra_data.get("adherence", 100.0)

def evaluate_patient_risk(patient: Patient) -> Dict[str, Any]:
    acwr = get_athlete_acwr(patient)
    pain = get_athlete_pain_level(patient)
    inactivity = get_days_inactive(patient)
    adherence = get_athlete_adherence(patient)
    
    # Deterministic Template Engine (Cost = $0, Latency = 0)
    # Check RED conditions
    if acwr >= 1.5 or pain > 7 or inactivity > 7:
        reason = "CHURN_INACTIVITY_7D" if inactivity > 7 else ("ACWR_DANGER" if acwr >= 1.5 else "PAIN_CRITICAL")
        
        # Select Deterministic Template
        if reason == "CHURN_INACTIVITY_7D":
            template = f"Hola {patient.full_name.split()[0]}, ¿cómo estás? Noté que no pudiste entrenar en los últimos días. ¡Cero estrés! Avisame si necesitas que reajustemos los días o el volumen para esta semana."
        else:
            template = f"Hola {patient.full_name.split()[0]}, noté en tu registro que venís con una sobrecarga importante esta semana. He ajustado tu plan temporalmente para protegerte y enfocarnos en la recuperación. ¿Cómo te sentís hoy?"
        
        return {
            "semaphore_status": "RED",
            "primary_risk_factor": reason,
            "context_metadata": {
                "days_inactive": inactivity,
                "acwr": acwr,
                "pain_level": pain,
                "last_attendance": patient.extra_data.get("last_attendance"),
                "suggested_template": template
            }
        }
        
    # Check YELLOW conditions
    if (1.3 < acwr < 1.5) or acwr < 0.8 or (4 <= pain <= 6):
        reason = "ACWR_OVERLOAD" if acwr > 1.3 else ("ACWR_DETRAINING" if acwr < 0.8 else "PAIN_MODERATE")
        
        # Select Deterministic Template
        if reason == "ACWR_DETRAINING":
            template = f"Hola {patient.full_name.split()[0]}, veo que bajamos un poco el ritmo. Contame cómo venís así calibramos los próximos entrenamientos."
        else:
            template = f"Hola {patient.full_name.split()[0]}, noté una ligera sobrecarga en tu registro. Contame cómo te venís sintiendo para ajustar la carga de esta semana."
            
        return {
            "semaphore_status": "YELLOW",
            "primary_risk_factor": reason,
            "context_metadata": {
                "acwr": acwr,
                "pain_level": pain,
                "suggested_template": template
            }
        }
        
    # Check GREEN conditions (Fallback default if not explicitly green? No, strict rules as per requirements)
    # GREEN: ACWR [0.8, 1.3], Adherence > 85%, Pain <= 3
    if (0.8 <= acwr <= 1.3) and adherence > 85.0 and pain <= 3:
        return {
            "semaphore_status": "GREEN",
            "primary_risk_factor": "OPTIMAL_ADAPTATION",
            "context_metadata": {
                "acwr": acwr,
                "adherence": adherence
            }
        }
        
    # Fallback to GREEN for now if uncategorized
    return {
        "semaphore_status": "GREEN",
        "primary_risk_factor": "STABLE",
        "context_metadata": {}
    }

@shared_task(name="app.worker.snapshot_tasks.sweep_daily_snapshots_nightly")
def sweep_daily_snapshots_nightly():
    """
    Celery Beat task to process daily snapshots.
    Iterates through patients whose local time is roughly 02:00 AM to calculate risk semaphores.
    """
    logger.info("Starting staggered daily snapshot sweep...")
    
    current_utc_hour = datetime.utcnow().hour
    # We want local time to be 02:00 AM.
    # Target Offset = 2 - current_utc_hour
    # For Argentina (UTC-3), local 02:00 AM happens at 05:00 AM UTC.
    
    db: Session = SessionLocal()
    try:
        # Paging through patients
        batch_size = 100
        offset = 0
        now = datetime.utcnow()
        
        while True:
            # En un entorno de producción estricto, filtraríamos por zona horaria de Patient.extra_data
            # Por ahora tomamos todos los pacientes, simulando que es su hora.
            patients = db.execute(select(Patient).offset(offset).limit(batch_size)).scalars().all()
            
            if not patients:
                break
                
            for patient in patients:
                # If patient is snoozed, skip evaluation
                if patient.snooze_until and patient.snooze_until > now:
                    continue
                    
                risk_data = evaluate_patient_risk(patient)
                
                # We could use update() for bulk if we pre-calculate. For now, ORM update is fine for batches.
                patient.semaphore_status = risk_data["semaphore_status"]
                patient.primary_risk_factor = risk_data["primary_risk_factor"]
                patient.context_metadata = risk_data["context_metadata"]
                patient.last_risk_evaluation = now
                
            db.commit()
            logger.info(f"Processed batch of {len(patients)} patients.")
            offset += batch_size
            
    except Exception as e:
        logger.error(f"Error processing daily snapshots: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()
        
    logger.info("Finished daily snapshot sweep.")

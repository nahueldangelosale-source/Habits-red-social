import math
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class SessionDriftStats:
    ratio_adherence: float  # completed / prescribed (0.0 to 1.0)
    modality_shift: float   # Force->Cardio = 1.0, Barbell->Dumbbell = 0.1
    is_clinical_protocol: bool # True if rehab

def calculate_dsi(stats: SessionDriftStats) -> float:
    """
    Calculates the Drift Severity Index (DSI) for a single workout session.
    Returns a score between 0.0 and 1.0.
    - < 0.15: Trivial (Green)
    - 0.15 - 0.49: Minor/Moderate (Yellow)
    - >= 0.50: Critical (Red)
    """
    w_adherence = 0.40
    w_modality = 0.35
    w_clinical = 0.25

    adherence_penalty = 1.0 - max(0.0, min(1.0, stats.ratio_adherence))
    modality_penalty = max(0.0, min(1.0, stats.modality_shift))
    clinical_penalty = 1.0 if stats.is_clinical_protocol else 0.0

    dsi = (w_adherence * adherence_penalty) + \
          (w_modality * modality_penalty) + \
          (w_clinical * clinical_penalty)
          
    return round(min(1.0, dsi), 3)

def evaluate_drift_severity(stats: SessionDriftStats) -> Dict[str, Any]:
    score = calculate_dsi(stats)
    color = "green"
    if score >= 0.50:
        color = "red"
    elif score >= 0.15:
        color = "yellow"
        
    return {
        "dsi_score": score,
        "color": color,
        "is_actionable": score >= 0.15
    }

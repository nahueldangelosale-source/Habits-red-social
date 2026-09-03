from dataclasses import dataclass

@dataclass
class AthleteStats:
    days_since_last_attendance: int
    recent_no_shows: int  # No-shows en los últimos 14 días
    attendance_rate_14d: float  # De 0.0 a 1.0
    consecutive_attendances: int  # Asistencias consecutivas recientes (Rescate)

def calculate_cri(stats: AthleteStats) -> int:
    """
    Motor determinístico puro para calcular el Churn Risk Index (CRI).
    Escala: 0 (Sin Riesgo) a 100 (Riesgo Crítico de Abandono).
    """
    score = 0
    
    # 1. Penalización por Inactividad
    if stats.days_since_last_attendance >= 14:
        score += 50
    elif stats.days_since_last_attendance >= 7:
        score += 30
    elif stats.days_since_last_attendance >= 3:
        score += 10
        
    # 2. Penalización Severa por No-Shows (Síntoma de desinterés activo)
    score += stats.recent_no_shows * 20
    
    # 3. Tasa de Asistencia deficiente
    if stats.attendance_rate_14d < 0.3:
        score += 25
    elif stats.attendance_rate_14d < 0.6:
        score += 15
        
    # 4. Bonus de Rescate (Mecanismo de redención por persistencia)
    score -= stats.consecutive_attendances * 10
    
    # Clamp estricto entre 0 y 100
    return max(0, min(100, score))

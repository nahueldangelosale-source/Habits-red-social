"""
Module: Acute:Chronic Workload Ratio (ACWR)
Domain: Math Engine
"""

def calculate_rolling_average(loads: list[float], days: int) -> float:
    """Calcula el promedio simple de los últimos `days`."""
    if not loads:
        return 0.0
    recent = loads[-days:] if len(loads) > days else loads
    return sum(recent) / len(recent)

def calculate_ewma(current_load: float, previous_ewma: float, span: int) -> float:
    """
    Calcula la Media Móvil Ponderada Exponencialmente (EWMA).
    Formula: EWMA_today = (Load_today * weight) + (EWMA_yesterday * (1 - weight))
    donde weight = 2 / (span + 1)
    """
    weight = 2 / (span + 1)
    return (current_load * weight) + (previous_ewma * (1 - weight))

def calculate_acwr_coupled(acute_load: float, chronic_load: float) -> float:
    """
    Calcula ACWR acoplado (donde la carga aguda está incluida en la crónica).
    Ideal es entre 0.8 y 1.3 (Sweet Spot).
    > 1.5 indica "Danger Zone".
    """
    if chronic_load == 0:
        return 0.0
    return round(acute_load / chronic_load, 2)

def calculate_acwr_uncoupled(acute_load: float, chronic_load_exclusive: float) -> float:
    """
    Calcula ACWR desacoplado (la carga crónica NO incluye los últimos 7 días).
    """
    if chronic_load_exclusive == 0:
        return 0.0
    return round(acute_load / chronic_load_exclusive, 2)

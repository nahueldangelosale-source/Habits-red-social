"""
Module: SNC Fatigue & Risk Modifiers
Domain: Math Engine
"""

def calculate_snc_fatigue_dissipation(current_fatigue: float, hours_rested: float, recovery_quality: float = 1.0) -> float:
    """
    Calcula la disipación no-lineal de la fatiga del Sistema Nervioso Central (SNC).
    La fatiga decae exponencialmente según las horas de descanso y la calidad de recuperación (sueño, nutrición).
    recovery_quality: 1.0 es normal. >1.0 es mejor, <1.0 es peor.
    """
    # Constante de decaimiento base (aprox 48h para recuperarse de fatiga 100)
    decay_constant = 0.05 * recovery_quality
    
    # Formula: F(t) = F_0 * e^(-k*t)
    import math
    new_fatigue = current_fatigue * math.exp(-decay_constant * hours_rested)
    return round(max(0.0, new_fatigue), 2)

def compute_session_fatigue(volume_kg: float, avg_rpe: float) -> float:
    """
    Calcula el pico de fatiga generado por una sola sesión.
    A mayor volumen y mayor RPE, el estrés sobre el SNC es multiplicativo.
    """
    # Constante de normalización arbitraria para mantener fatiga en escala 0-100
    base_stress = volume_kg / 1000.0
    rpe_multiplier = 1.0 + (avg_rpe / 10.0)**2  # RPE alto (9-10) aumenta drásticamente el impacto
    
    generated_fatigue = base_stress * rpe_multiplier
    return round(min(100.0, generated_fatigue), 2)

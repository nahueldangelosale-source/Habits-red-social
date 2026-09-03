"""
Module: Estimated 1 Rep Max (e1RM) Calculations
Domain: Math Engine
"""

def calculate_e1rm_epley(weight: float, reps: int) -> float:
    """
    Epley formula: e1RM = weight * (1 + reps / 30)
    Recommended for reps < 10.
    """
    if reps == 1:
        return weight
    return weight * (1 + (reps / 30))

def calculate_e1rm_brzycki(weight: float, reps: int) -> float:
    """
    Brzycki formula: e1RM = weight * (36 / (37 - reps))
    """
    if reps == 1:
        return weight
    if reps >= 37:
        return weight * 2.5 # Fallback cap
    return weight * (36 / (37 - reps))

def calculate_e1rm_from_rpe(weight: float, reps: int, rpe: float) -> float:
    """
    Estimates 1RM using RPE scale based on RIR (Reps in Reserve).
    RIR = 10 - RPE.
    Total virtual reps = reps + RIR.
    Applies Epley formula using total virtual reps.
    """
    rir = max(0, 10 - rpe)
    virtual_reps = reps + rir
    return calculate_e1rm_epley(weight, virtual_reps)

def get_best_e1rm(sets_data: list[dict]) -> float:
    """
    Takes a list of sets: [{'weight': 100, 'reps': 5, 'rpe': 8}, ...]
    And returns the highest estimated 1RM for the exercise.
    """
    highest = 0.0
    for s in sets_data:
        weight = s.get('weight', 0)
        reps = s.get('reps', 0)
        rpe = s.get('rpe', None)
        
        if reps == 0:
            continue
            
        if rpe is not None and rpe >= 6:
            current_e1rm = calculate_e1rm_from_rpe(weight, reps, rpe)
        else:
            current_e1rm = calculate_e1rm_epley(weight, reps)
            
        if current_e1rm > highest:
            highest = current_e1rm
            
    return round(highest, 2)

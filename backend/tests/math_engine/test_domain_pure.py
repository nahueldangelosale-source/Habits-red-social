import pytest
from app.domain.math_engine.e1rm import (
    calculate_e1rm_epley,
    calculate_e1rm_brzycki,
    calculate_e1rm_from_rpe,
    get_best_e1rm
)
from app.domain.math_engine.acwr import (
    calculate_ewma,
    calculate_acwr_coupled
)
from app.domain.math_engine.snc_fatigue import (
    calculate_snc_fatigue_dissipation,
    compute_session_fatigue
)

@pytest.mark.parametrize("weight, reps, expected", [
    (100.0, 1, 100.0),
    (100.0, 5, 116.67), # 100 * (1 + 5/30) = 116.666...
    (80.0, 10, 106.67), # 80 * (1 + 10/30) = 106.666...
])
def test_calculate_e1rm_epley(weight, reps, expected):
    result = calculate_e1rm_epley(weight, reps)
    assert result == pytest.approx(expected, 0.01)

@pytest.mark.parametrize("weight, reps, expected", [
    (100.0, 1, 100.0),
    (100.0, 5, 112.5), # 100 * (36 / 32) = 112.5
    (80.0, 10, 106.67), # 80 * (36 / 27) = 106.666...
])
def test_calculate_e1rm_brzycki(weight, reps, expected):
    result = calculate_e1rm_brzycki(weight, reps)
    assert result == pytest.approx(expected, 0.01)

def test_get_best_e1rm():
    sets_data = [
        {'weight': 100, 'reps': 5, 'rpe': 8}, # Epley (virtual reps = 5 + 2 = 7) -> 100 * (1 + 7/30) = 123.33
        {'weight': 110, 'reps': 2, 'rpe': 9}, # Epley (virtual reps = 2 + 1 = 3) -> 110 * (1 + 3/30) = 121.0
        {'weight': 120, 'reps': 1, 'rpe': 10}, # Epley (virtual reps = 1 + 0 = 1) -> 120.0
    ]
    best_e1rm = get_best_e1rm(sets_data)
    assert best_e1rm == pytest.approx(123.33, 0.01)

def test_acwr_coupled():
    acwr = calculate_acwr_coupled(acute_load=1500, chronic_load=1200)
    assert acwr == 1.25 # Sweet Spot

def test_snc_fatigue_dissipation():
    # 100 de fatiga base, 48 horas de descanso, factor de recuperación 1.0 (decay 0.05)
    # e^(-0.05 * 48) = e^(-2.4) ~ 0.0907
    # 100 * 0.0907 = 9.07
    residual_fatigue = calculate_snc_fatigue_dissipation(100.0, 48)
    assert residual_fatigue == pytest.approx(9.07, 0.01)

    # Con recuperación de 1.5 (muy buena), decae más rápido (decay 0.075)
    # e^(-0.075 * 48) = e^(-3.6) ~ 0.0273
    residual_fatigue_good = calculate_snc_fatigue_dissipation(100.0, 48, 1.5)
    assert residual_fatigue_good == pytest.approx(2.73, 0.01)

import pytest
from app.domain.watchtower.cri_engine import AthleteStats, calculate_cri

def test_cri_zero_for_active_athlete():
    stats = AthleteStats(
        days_since_last_attendance=1,
        recent_no_shows=0,
        attendance_rate_14d=1.0,
        consecutive_attendances=3
    )
    score = calculate_cri(stats)
    assert score == 0

def test_cri_critical_for_ghosting():
    # Lleva 15 días sin ir y faltó 2 veces
    stats = AthleteStats(
        days_since_last_attendance=15, # +50
        recent_no_shows=2,             # +40
        attendance_rate_14d=0.2,       # +25
        consecutive_attendances=0
    )
    score = calculate_cri(stats)
    assert score == 100  # Clamp a 100 (50 + 40 + 25 = 115)

def test_cri_warning_for_sporadic_attendance():
    # Va a veces, lleva 8 días sin ir
    stats = AthleteStats(
        days_since_last_attendance=8,  # +30
        recent_no_shows=1,             # +20
        attendance_rate_14d=0.5,       # +15
        consecutive_attendances=0
    )
    score = calculate_cri(stats)
    assert score == 65 # 30 + 20 + 15 = 65

def test_cri_rescue_bonus():
    # Estuvo mal, pero está mejorando (bonus de rescate)
    stats = AthleteStats(
        days_since_last_attendance=1,  # 0
        recent_no_shows=1,             # +20
        attendance_rate_14d=0.5,       # +15
        consecutive_attendances=2      # -20
    )
    score = calculate_cri(stats)
    assert score == 15 # 20 + 15 - 20 = 15

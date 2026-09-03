import pytest
from app.schemas.clinical import AthleteProfile, CleanWorkoutDay, CleanWorkoutItem
from app.services.clinical_engine import ClinicalEngine

@pytest.fixture
def dummy_profile():
    return AthleteProfile(
        id="nahuel_dangelo",
        tenant_id="default_tenant",
        injuries=["INJ_SHLD_01", "INJ_LUMB_01"], # Hombro (Pinzamiento) y Lumbar (L4-L5)
        session_location="Gym",
        cns_fatigue_score="LOW"
    )

@pytest.fixture
def raw_workout_day():
    return CleanWorkoutDay(
        day_name="Push & Legs Day",
        items=[
            CleanWorkoutItem(
                id="item_1",
                exercise_id="ex_press_militar",
                official_name="Press Militar",
                sets="4", reps="8", rpe="8", weight="Auto",
                axial_load=True,
                movement_pattern="Empuje Vertical"
            ),
            CleanWorkoutItem(
                id="item_2",
                exercise_id="ex_back_squat",
                official_name="Sentadilla Trasera",
                sets="3", reps="5", rpe="9", weight="160kg",
                axial_load=True,
                movement_pattern="Dominante de Rodilla"
            )
        ]
    )

def test_rule1_shoulder_impingement(dummy_profile, raw_workout_day):
    """Test: Pinzamiento Subacromial -> No Empuje Vertical"""
    engine = ClinicalEngine()
    
    clean_day = engine.process_day(dummy_profile, raw_workout_day)
    
    # Assert Press Militar is gone and replaced
    assert not any(item.official_name == "Press Militar" for item in clean_day.items)
    assert any("Landmine" in item.official_name or "Mancuernas" in item.official_name for item in clean_day.items)
    
    # Assert XAI is present
    swap = next((s for s in clean_day.swaps if s.original_exercise_id == "ex_press_militar"), None)
    assert swap is not None
    assert "Pinzamiento" in swap.clinical_rationale

def test_rule2_lumbar_strain(dummy_profile, raw_workout_day):
    """Test: Tensión L4-L5 -> No Carga Axial"""
    engine = ClinicalEngine()
    
    clean_day = engine.process_day(dummy_profile, raw_workout_day)
    
    assert not any(item.official_name == "Sentadilla Trasera" for item in clean_day.items)
    assert any(item.official_name in ["Sentadilla Búlgara", "Hip Thrust"] for item in clean_day.items)

def test_rule3_home_gym():
    """Test: Home Gym -> No Barbell/Machine"""
    home_profile = AthleteProfile(
        id="nahuel_home", tenant_id="t1", injuries=[], session_location="Home", cns_fatigue_score="LOW"
    )
    raw_day = CleanWorkoutDay(
        day_name="Home Workout",
        items=[
            CleanWorkoutItem(
                id="i1", exercise_id="ex_leg_press", official_name="Leg Press Machine",
                sets="3", reps="12", rpe="8", weight="Auto", axial_load=False, movement_pattern="Dominante de Rodilla"
            )
        ]
    )
    
    engine = ClinicalEngine()
    clean_day = engine.process_day(home_profile, raw_day)
    
    assert not any("Machine" in item.official_name for item in clean_day.items)

def test_rule4_cns_fatigue(dummy_profile, raw_workout_day):
    """Test: Alta Fatiga SNC -> Reducir RPE a <= 8"""
    dummy_profile.cns_fatigue_score = "HIGH"
    
    engine = ClinicalEngine()
    clean_day = engine.process_day(dummy_profile, raw_workout_day)
    
    for item in clean_day.items:
        # RPE must be <= 8 if it was numeric
        rpe_val = int(item.rpe) if item.rpe.isdigit() else 8
        assert rpe_val <= 8

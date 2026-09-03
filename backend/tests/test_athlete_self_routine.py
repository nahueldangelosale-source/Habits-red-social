import pytest
from app.api.athlete import (
    SelfAssignRoutineRequest,
    SelfRoutineDayInput,
    SelfRoutineExerciseInput,
)


def test_self_assign_routine_schemas():
    # 1. Test empty request (triggers default 3-day routine)
    empty_req = SelfAssignRoutineRequest()
    assert empty_req.template_id is None
    assert empty_req.title == "Mi Rutina Personalizada"
    assert empty_req.days is None

    # 2. Test template cloning request
    template_req = SelfAssignRoutineRequest(
        template_id="12345678-1234-5678-1234-567812345678",
        title="Rutina FIE Fuerza",
    )
    assert template_req.template_id == "12345678-1234-5678-1234-567812345678"
    assert template_req.title == "Rutina FIE Fuerza"

    # 3. Test structured custom days request
    custom_req = SelfAssignRoutineRequest(
        title="Torso / Pierna Personalizada",
        days=[
            SelfRoutineDayInput(
                name="Día 1 - Torso",
                order=0,
                exercises=[
                    SelfRoutineExerciseInput(
                        exercise_name="Press de Banca",
                        sets=4,
                        reps=8,
                        rpe=8,
                        weight=70.0,
                        rest_seconds=120,
                    ),
                    SelfRoutineExerciseInput(
                        exercise_name="Remo con Barra",
                        sets=4,
                        reps=10,
                        rpe=8,
                        weight=60.0,
                        rest_seconds=90,
                    ),
                ],
            ),
            SelfRoutineDayInput(
                name="Día 2 - Pierna",
                order=1,
                exercises=[
                    SelfRoutineExerciseInput(
                        exercise_name="Sentadilla",
                        sets=4,
                        reps=8,
                        rpe=8,
                        weight=90.0,
                    ),
                ],
            ),
        ],
    )
    assert len(custom_req.days) == 2
    assert custom_req.days[0].name == "Día 1 - Torso"
    assert len(custom_req.days[0].exercises) == 2
    assert custom_req.days[0].exercises[0].exercise_name == "Press de Banca"
    assert custom_req.days[0].exercises[0].sets == 4
    assert custom_req.days[1].exercises[0].weight == 90.0


if __name__ == "__main__":
    test_self_assign_routine_schemas()
    print("[OK] All athlete self-assign routine unit tests passed successfully!")

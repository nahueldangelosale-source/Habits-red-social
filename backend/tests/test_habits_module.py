import pytest
from app.services.habit_service import HabitService


def test_habit_service_evaluate_zone_boolean():
    assert HabitService.evaluate_zone("BOOLEAN", None, None, True) == "HIGH"
    assert HabitService.evaluate_zone("BOOLEAN", None, None, False) == "NONE"


def test_habit_service_evaluate_zone_numeric():
    # Target = 2.0 (L)
    # 2.0 / 2.0 = 100% -> HIGH
    assert HabitService.evaluate_zone("NUMERIC", 2.0, 2.0, True) == "HIGH"
    # 1.8 / 2.0 = 90% -> LOW (Lally tolerance)
    assert HabitService.evaluate_zone("NUMERIC", 2.0, 1.8, True) == "LOW"
    # 1.5 / 2.0 = 75% -> NONE (<90% breaks streak)
    assert HabitService.evaluate_zone("NUMERIC", 2.0, 1.5, True) == "NONE"


def test_habit_service_lally_levels():
    assert HabitService.recalc_level(0) == 0
    assert HabitService.recalc_level(6) == 0
    assert HabitService.recalc_level(7) == 1   # Semana 1 (7 días)
    assert HabitService.recalc_level(20) == 1
    assert HabitService.recalc_level(21) == 2  # Hábito (21 días)
    assert HabitService.recalc_level(45) == 3  # Automático (45 días)
    assert HabitService.recalc_level(66) == 4  # Lally (66 días)
    assert HabitService.recalc_level(90) == 5  # Maestro (90 días)
    assert HabitService.recalc_level(180) == 6 # Veterano (180 días)
    assert HabitService.recalc_level(365) == 7 # Leyenda (365 días)


if __name__ == "__main__":
    test_habit_service_evaluate_zone_boolean()
    test_habit_service_evaluate_zone_numeric()
    test_habit_service_lally_levels()
    print("[OK] All HabitService unit tests passed successfully!")



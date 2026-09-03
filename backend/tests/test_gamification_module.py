from app.services.gamification_service import GamificationService


def test_calculate_level():
    assert GamificationService.calculate_level(0) == 1
    assert GamificationService.calculate_level(50) == 13
    assert GamificationService.calculate_level(200) == 26
    assert GamificationService.calculate_level(1000) == 57


def test_level_titles():
    assert GamificationService.get_level_title(1) == "Novato"
    assert GamificationService.get_level_title(5) == "Novato"
    assert GamificationService.get_level_title(6) == "Guerrero"
    assert GamificationService.get_level_title(10) == "Guerrero"
    assert GamificationService.get_level_title(11) == "Titán"
    assert GamificationService.get_level_title(15) == "Titán"
    assert GamificationService.get_level_title(16) == "Leyenda"
    assert GamificationService.get_level_title(25) == "Leyenda"


def test_xp_progress_structure():
    progress = GamificationService.get_xp_progress(2)
    assert progress["current_xp"] == 2
    assert progress["current_level"] == 3
    assert progress["level_title"] == "Novato"
    assert progress["xp_for_current_level"] <= 2
    assert progress["xp_for_next_level"] > 2
    assert 0 <= progress["progress_percent"] <= 100
    assert progress["remaining_xp"] > 0


if __name__ == "__main__":
    test_calculate_level()
    test_level_titles()
    test_xp_progress_structure()
    print("[OK] All GamificationService unit tests passed successfully!")

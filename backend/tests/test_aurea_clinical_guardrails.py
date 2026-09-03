import pytest

# Simulación de la función de AUREA que aplica la Matriz de Lesiones a los resultados recuperados
def apply_lumbar_guardrails(exercises):
    """
    Motor determinista que recibe los ejercicios recuperados por AUREA
    y aplica los bloqueos y excepciones clínicas de la Matriz de Lesiones para 'Lumbar'.
    """
    safe_exercises = []
    
    for ex in exercises:
        name = ex.get("name", "")
        axial_load = ex.get("axial_load", False)
        
        # 1. Red Flags (Bloqueo Absoluto)
        if name in ["Sentadilla Trasera con Barra", "Peso Muerto Convencional", "Sit-ups", "Extensiones Lumbares"]:
            continue
            
        # 2. Excepciones Permitidas (Safe Alternatives)
        if "Búlgara" in name or "Hip Thrust" in name or "Plancha" in name or "Bird-Dog" in name:
            safe_exercises.append(ex)
            continue
            
        # 3. Regla General: Sin Carga Axial
        if axial_load:
            continue
            
        safe_exercises.append(ex)
        
    return safe_exercises

def test_aurea_blocks_lumbar_red_flags():
    """
    Asegura que los ejercicios con bloqueo absoluto no se filtren jamás 
    en un perfil lumbar, incluso si el LLM trata de forzarlos.
    """
    mock_db_results = [
        {"name": "Sentadilla Trasera con Barra", "axial_load": True},
        {"name": "Peso Muerto Convencional", "axial_load": True},
        {"name": "Curl de Bíceps", "axial_load": False}
    ]
    
    filtered = apply_lumbar_guardrails(mock_db_results)
    names = [ex["name"] for ex in filtered]
    
    assert "Sentadilla Trasera con Barra" not in names, "ERROR CLÍNICO: Sentadilla Trasera no fue bloqueada."
    assert "Peso Muerto Convencional" not in names, "ERROR CLÍNICO: Peso Muerto no fue bloqueado."
    assert "Curl de Bíceps" in names, "Curl de Bíceps debería estar permitido."

def test_aurea_allows_lumbar_safe_alternatives():
    """
    Asegura que las alternativas seguras (Sentadilla Búlgara) estén permitidas
    incluso si originalmente están catalogadas con carga axial parcial.
    """
    mock_db_results = [
        {"name": "Sentadilla Búlgara", "axial_load": True},  # Unilateral pero con carga axial
        {"name": "Hip Thrust", "axial_load": False},
        {"name": "Prensa de Piernas", "axial_load": False}
    ]
    
    filtered = apply_lumbar_guardrails(mock_db_results)
    names = [ex["name"] for ex in filtered]
    
    assert "Sentadilla Búlgara" in names, "ERROR CLÍNICO: Excepción de Sentadilla Búlgara no funcionó."
    assert "Hip Thrust" in names, "ERROR CLÍNICO: Excepción de Hip Thrust no funcionó."

def test_aurea_blocks_generic_axial_load():
    """
    Asegura que cualquier otro ejercicio con carga axial (que no sea una excepción)
    sea bloqueado por el filtro.
    """
    mock_db_results = [
        {"name": "Press Militar de Pie con Barra", "axial_load": True},
        {"name": "Sentadilla Frontal", "axial_load": True},
        {"name": "Elevación Lateral", "axial_load": False}
    ]
    
    filtered = apply_lumbar_guardrails(mock_db_results)
    names = [ex["name"] for ex in filtered]
    
    assert "Press Militar de Pie con Barra" not in names
    assert "Sentadilla Frontal" not in names
    assert "Elevación Lateral" in names

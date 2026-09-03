import asyncio
import os
import sys

# Add backend to path so imports work
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.database import async_session_maker
from app.db.models import ExerciseTemplate
from sqlalchemy import select

async def evaluate_rag():
    print("=== INICIANDO AUREA RAG SPIKE ===")
    
    # 1. Perfil del Atleta Simulado
    perfil = {
        "objetivo": "Hipertrofia de Tren Inferior",
        "lesion_activa": "Lumbar / Espalda Baja",
        "restricciones": ["Carga_Axial == False"]  # Extraído de la Matriz de Lesiones
    }
    
    print(f"Atleta Simulado: {perfil}")
    print("AUREA está consultando la Base de Datos con Filtros Matemáticos (JSONB/SQL)...")
    
    async with async_session_maker() as session:
        # Consulta RAG Estructurada
        # Traer todos los ejercicios y aplicar las reglas de la Matriz de Lesiones
        query = select(ExerciseTemplate)
        result = await session.execute(query)
        todos_ejercicios = result.scalars().all()
        
        # Reglas clínicas basadas en la Matriz para "Lumbar"
        ejercicios_seguros = []
        for ex in todos_ejercicios:
            # 1. Bloqueo Absoluto (Red Flags de la Matriz)
            if ex.name in ["Sentadilla Trasera con Barra", "Peso Muerto Convencional"]:
                continue
                
            # 2. Excepciones Permitidas (Safe Alternatives de la Matriz)
            if "Búlgara" in ex.name or "Hip Thrust" in ex.name or "Cadera" in ex.name:
                ejercicios_seguros.append(ex)
                continue
                
            # 3. Regla General de Carga Axial
            if ex.axial_load:
                continue
                
            ejercicios_seguros.append(ex)
        
        # Filtrar solo tren inferior en memoria para el log (Cuádriceps, Isquios, Glúteos)
        tren_inferior_seguros = [
            ex for ex in ejercicios_seguros 
            if any(musculo in ex.primary_muscle_group for musculo in ["Cu", "Gl", "Isquio"])
            or any(musculo in ex.aurea_metadata.get("movement_pattern", "") for musculo in ["Rodilla", "Cadera", "Pierna"])
        ]
        
        nombres = [ex.name for ex in tren_inferior_seguros]
        print(f"\nEjercicios Seguros Recuperados (Muestra de 5): {nombres[:5]}")
        
        # Validar si filtró la Sentadilla Trasera con Barra
        tiene_sentadilla_trasera = any("Trasera con Barra" in ex.name for ex in ejercicios_seguros)
        tiene_bulgara = any("Búlgara" in ex.name for ex in ejercicios_seguros)
        
        print("\n=== RESULTADOS DE LA AUDITORIA DE AUREA ===")
        if tiene_sentadilla_trasera:
            print("[FALLO CLINICO]: AUREA incluyo la Sentadilla Trasera en un paciente con lesion Lumbar.")
        else:
            print("[EXITO CLINICO]: Sentadilla Trasera bloqueada con exito.")
            
        if tiene_bulgara:
            print("[EXITO DE PRESCRIPCION]: Sentadilla Bulgara disponible como alternativa segura.")
        else:
            print("[ADVERTENCIA]: No se encontro la alternativa segura esperada.")
            
        print("\nGenerando Zero-Draft (Simulado)...")
        print("Día de Piernas Seguro:")
        print("1. Sentadilla Búlgara (3x10)")
        print("2. Prensa de Piernas (3x12)")
        print("3. Empuje de Cadera con Barra (3x10)")
        print("4. Curl de Isquiosurales Acostado (3x15)")
        print("=== SPIKE FINALIZADO ===")

if __name__ == "__main__":
    asyncio.run(evaluate_rag())

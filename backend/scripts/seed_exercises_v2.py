import csv
import asyncio
import uuid
import os
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from app.db.connection import async_session_maker
from app.db.models import Exercise

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "_Taxonomía de Ejercicios.csv")

def parse_list(value):
    if not value or value.strip() == "" or value.lower() == "ninguno":
        return []
    # Remove quotes if any and split by comma
    return [item.strip().strip('"') for item in value.split(",")]

def parse_bool(value):
    return value.strip().upper() == "SÍ"

async def seed_exercises_v2():
    print(f"🚀 Iniciando ingesta de taxonomía desde: {CSV_PATH}")
    
    if not os.path.exists(CSV_PATH):
        print(f"❌ Error: No se encontró el archivo CSV en {CSV_PATH}")
        return

    exercices_to_ingest = []
    
    with open(CSV_PATH, mode='r', encoding='utf-8-sig') as f:
        cleaned_lines = []
        for line in f:
            line = line.strip()
            if not line:
                continue
            # Use csv.reader to unquote the whole-row quote cleanly
            # This handles internal double-quotes "" automatically
            try:
                row_raw_list = list(csv.reader([line]))[0]
                if row_raw_list:
                    cleaned_lines.append(row_raw_list[0])
            except Exception as e:
                print(f"⚠️ Error cleaning line: {line[:50]}... -> {e}")
                continue
            
        raw_reader = csv.reader(cleaned_lines)
        header = next(raw_reader)
        
        for row_list in raw_reader:
            try:
                # Area de autocuración: Si la fila tiene más columnas que el header,
                # es probable que haya comas no escapadas en Equipamiento o Sinergistas.
                # Consolidamos el excedente en la posición de Equipamiento (indice 8).
                if len(row_list) > len(header):
                    # Asumimos que los últimos dos campos (Nivel Habilidad e Impacto) están al final
                    # y los primeros 8 (ID a Agonista) están al principio.
                    merged_equipment = ", ".join(row_list[8:-2])
                    row_list = row_list[:8] + [merged_equipment] + row_list[-2:]
                
                # Convertir a diccionario usando el header oficial
                row = dict(zip(header, row_list))
                
                # Generate deterministic UUID for the primary key 'id'
                deterministic_id = uuid.uuid5(uuid.NAMESPACE_DNS, f"bienestar.exercise.{row['ID_Ejercicio']}")
                
                exercice_data = {
                    "id": deterministic_id,
                    "exercise_id": row['ID_Ejercicio'],
                    "official_name": row['Nombre_Oficial'],
                    "search_aliases": row['Alias_Buscador'],
                    "movement_pattern": row['Patron_Movimiento'],
                    "laterality": row['Lateralidad'],
                    "axial_load": parse_bool(row['Carga_Axial']),
                    "primary_muscle": row['Musculo_Agonista'],
                    "synergist_muscles": parse_list(row['Musculos_Sinergistas']),
                    "equipment_required": parse_list(row['Equipamiento_Requerido']),
                    "skill_level": int(row['Nivel_Habilidad'].strip()) if row.get('Nivel_Habilidad') and row['Nivel_Habilidad'].strip() else 1,
                    "joint_impact": row['Nivel_Impacto_Articular']
                }
                exercices_to_ingest.append(exercice_data)
            except Exception as e:
                print(f"❌ Error procesando fila: {row}")
                raise e

    print(f"📂 Procesados {len(exercices_to_ingest)} ejercicios del CSV.")

    async with async_session_maker() as session:
        count = 0
        for data in exercices_to_ingest:
            # Upsert logic based on exercise_id
            stmt = insert(Exercise).values(**data)
            stmt = stmt.on_conflict_do_update(
                index_elements=['exercise_id'],
                set_={k: v for k, v in data.items() if k != 'exercise_id'}
            )
            await session.execute(stmt)
            count += 1
            
        await session.commit()
        print(f"✅ Taxonomía inyectada exitosamente. Total: {count} ejercicios.")

if __name__ == "__main__":
    asyncio.run(seed_exercises_v2())

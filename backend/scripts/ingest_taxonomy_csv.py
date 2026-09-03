import os
import csv
import sys
import uuid
import asyncio
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from app.db.connection import async_session_maker
from app.db.models import Exercise

CSV_PATH = Path(__file__).resolve().parent.parent / "_Taxonomía de Ejercicios.csv"

def parse_list(value: str) -> list:
    if not value or value.strip() == "":
        return []
    return [v.strip() for v in value.split(",")]

async def ingest_taxonomy():
    if not CSV_PATH.exists():
        print(f"Error: No se encontro el CSV en {CSV_PATH}")
        return

    print("Iniciando inyeccion idempotente de Taxonomia de Ejercicios (Lote Completo)...")
    
    upsert_count = 0
    insert_count = 0
    
    with open(CSV_PATH, mode="r", encoding="utf-8-sig") as file:
        # The CSV has lines fully wrapped in quotes, let's strip them
        lines = [line.strip().strip('"') for line in file.readlines()]
        reader = csv.DictReader(lines)
        
        async with async_session_maker() as db:
            for row in reader:
                ex_id = row.get("ID_Ejercicio")
                if not ex_id:
                    continue
                
                # Check if exists
                stmt = select(Exercise).where(Exercise.exercise_id == ex_id)
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()
                
                synergists = parse_list(row.get("Musculos_Sinergistas", ""))
                equipment = parse_list(row.get("Equipamiento_Requerido", ""))
                
                # Convert string boolean
                axial_load = True if row.get("Carga_Axial", "").strip().upper() in ("SÍ", "SI", "TRUE", "1") else False
                
                # Parse integers
                try:
                    skill_level = int(row.get("Nivel_Habilidad", "1"))
                except ValueError:
                    skill_level = 1
                
                if existing:
                    # Upsert
                    existing.official_name = row.get("Nombre_Oficial", existing.official_name)
                    existing.search_aliases = row.get("Alias_Buscador", existing.search_aliases)
                    existing.movement_pattern = row.get("Patron_Movimiento", existing.movement_pattern)
                    existing.laterality = row.get("Lateralidad", existing.laterality)
                    existing.axial_load = axial_load
                    existing.primary_muscle = row.get("Musculo_Agonista", existing.primary_muscle)
                    existing.synergist_muscles = synergists
                    existing.equipment_required = equipment
                    existing.skill_level = skill_level
                    existing.joint_impact = row.get("Nivel_Impacto_Articular", existing.joint_impact)
                    existing.is_global = True
                    upsert_count += 1
                else:
                    # Insert
                    new_ex = Exercise(
                        id=uuid.uuid4(),
                        exercise_id=ex_id,
                        official_name=row.get("Nombre_Oficial"),
                        search_aliases=row.get("Alias_Buscador", ""),
                        movement_pattern=row.get("Patron_Movimiento", ""),
                        laterality=row.get("Lateralidad", ""),
                        axial_load=axial_load,
                        primary_muscle=row.get("Musculo_Agonista", ""),
                        synergist_muscles=synergists,
                        equipment_required=equipment,
                        skill_level=skill_level,
                        joint_impact=row.get("Nivel_Impacto_Articular", ""),
                        is_global=True,
                        trainer_id=None,
                        video_url=None
                    )
                    db.add(new_ex)
                    insert_count += 1
            
            await db.commit()
            
    print(f"Inyeccion completada con exito. Insertados: {insert_count}, Actualizados: {upsert_count}")

if __name__ == "__main__":
    asyncio.run(ingest_taxonomy())

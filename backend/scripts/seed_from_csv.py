import asyncio
import csv
import uuid
import os
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.connection import async_session_maker
from app.db.models import Exercise

# Configuración
CSV_PATH = "app/_Taxonomía de Ejercicios.csv" # Relativo a /backend

def get_stable_uuid(exercise_id_str: str) -> uuid.UUID:
    """Genera un UUID estable a partir del ID de la taxonomía."""
    return uuid.uuid5(uuid.NAMESPACE_DNS, f"bienestar.app.exercise.{exercise_id_str}")

async def seed_from_csv():
    print(f"🚀 Iniciando Pipeline ETL desde {CSV_PATH}...")
    
    if not os.path.exists(CSV_PATH):
        # Intentar ruta alternativa si se corre desde /backend o /
        alt_path = "_Taxonomía de Ejercicios.csv"
        if os.path.exists(alt_path):
            active_path = alt_path
        else:
            print(f"❌ Error: No se encontró el archivo CSV en {CSV_PATH}")
            return
    else:
        active_path = CSV_PATH

    count = 0
    async with async_session_maker() as db:
        with open(active_path, mode='r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # 1. Filtro de Basura / Encabezados
                ex_id_str = row.get('ID_Ejercicio')
                if not ex_id_str or ex_id_str.strip() == "" or ex_id_str.startswith('Lote'):
                    continue
                
                # 2. Transformación
                # UUID estable
                exercise_uuid = get_stable_uuid(ex_id_str)
                
                # Conversión Booleana
                carga_axial = row['Carga_Axial'].strip().upper() == "SÍ"
                
                # Conversión de Arrays
                def clean_list(s):
                    if not s or s.lower() == "ninguno" or s.lower() == "n/a":
                        return []
                    return [x.strip() for x in s.split(',')]

                sinergistas = clean_list(row['Musculos_Sinergistas'])
                equipamiento = clean_list(row['Equipamiento_Requerido'])
                
                # Conversión Numérica
                try:
                    habilidad = int(row['Nivel_Habilidad'])
                except (ValueError, TypeError):
                    habilidad = 3 # Default logic
                
                # 3. Load (Upsert Idempotente)
                existing = await db.get(Exercise, exercise_uuid)
                
                exercise_data = {
                    "id": exercise_uuid,
                    "nombre_oficial": row['Nombre_Oficial'],
                    "alias_buscador": row['Alias_Buscador'],
                    "patron_movimiento": row['Patron_Movimiento'],
                    "lateralidad": row['Lateralidad'],
                    "carga_axial": carga_axial,
                    "musculo_agonista": row['Musculo_Agonista'],
                    "musculos_sinergistas": sinergistas,
                    "equipamiento_requerido": equipamiento,
                    "nivel_habilidad": habilidad,
                    "nivel_impacto_articular": row['Nivel_Impacto_Articular']
                }

                if existing:
                    # Update
                    for key, value in exercise_data.items():
                        setattr(existing, key, value)
                else:
                    # Insert
                    db.add(Exercise(**exercise_data))
                
                count += 1
        
        await db.commit()
    
    print(f"✅ Inyección completada: {count} ejercicios procesados exitosamente.")

if __name__ == "__main__":
    asyncio.run(seed_from_csv())

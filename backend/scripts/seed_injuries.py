# backend/scripts/seed_injuries.py
import os
import sys
import csv
import uuid
from typing import List

# Añadir el path raíz para poder importar app
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_path)
os.chdir(backend_path)  # Asegurar que Pydantic encuentre el .env

from app.db.database import sync_session_maker, sync_engine, Base
from app.db.models import InjuryMatrix

CSV_FILE = "Matriz de Lesiones y Contraindicaciones.csv"

def parse_list(data: str) -> List[str]:
    """
    Parsea strings del CSV que pueden venir separados por comas o puntos y comas.
    """
    if not data:
        return []
    # Normalizar separadores y limpiar espacios
    items = []
    # Manejar posibles saltos de línea dentro de celdas
    normalized = data.replace('\n', ' ').replace(';', ',')
    for part in normalized.split(','):
        clean = part.strip()
        if clean:
            items.append(clean)
    return items

def seed_injuries():
    # Ruta absoluta al CSV (ubicado en el root del backend)
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_path, CSV_FILE)
    
    print(f"🔍 Buscando CSV en: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: Archivo {csv_path} no encontrado.")
        return

    # Asegurar que la tabla existe (Sync)
    from app.config import get_settings
    settings = get_settings()
    
    # Parchear SSL para psycopg2 (sync)
    sync_url = settings.database_url.replace("+asyncpg", "").replace("ssl=require", "sslmode=require")
    
    from sqlalchemy import create_engine
    temp_sync_engine = create_engine(sync_url)
    
    print("🛠️ Verificando esquema de base de datos...")
    Base.metadata.create_all(bind=temp_sync_engine, tables=[InjuryMatrix.__table__])

    db = sync_session_maker() # Nota: sync_session_maker en database.py podría fallar si usa el original
    # Para mayor seguridad, creamos una sesión local con el motor parcheado
    from sqlalchemy.orm import sessionmaker
    temp_session_maker = sessionmaker(bind=temp_sync_engine, expire_on_commit=False)
    db = temp_session_maker()
    try:
        # Usamos utf-8-sig para manejar posibles BOM de Excel
        with open(csv_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                injury_tag = row.get('ID_Lesion')
                if not injury_tag:
                    continue
                    
                # Buscar existente para Upsert
                existing = db.query(InjuryMatrix).filter(InjuryMatrix.injury_tag == injury_tag).first()
                
                contraindicated = parse_list(row.get('Patrones_Movimiento_Bloqueados', ''))
                recommended = parse_list(row.get('Alternativas_Seguras_Recomendadas', ''))
                red_flags = parse_list(row.get('Ejercicios_Bandera_Roja', ''))
                
                # Mapeo según estructura del CSV
                data = {
                    "name": row.get('Zona_Dolor'),
                    "pathology": row.get('Patologia_Comun_Asociada'),
                    "contraindicated_patterns": contraindicated,
                    "recommended_patterns": recommended,
                    "red_flag_exercises": red_flags,
                    "mutation_rules": row.get('Regla_de_Mutacion_Algoritmica'),
                    "notes": row.get('Mecanismo_Agravante_Biomecanico'),
                }
                
                if existing:
                    for key, value in data.items():
                        setattr(existing, key, value)
                else:
                    new_injury = InjuryMatrix(
                        injury_tag=injury_tag,
                        **data
                    )
                    db.add(new_injury)
                
                count += 1
            
            db.commit()
            print(f"✅ Matriz de Lesiones inyectada exitosamente. ({count} registros)")
            
    except Exception as e:
        db.commit() # Intentar salvar lo que se pueda si fallara uno solo (o rollback si es prefereible)
        print(f"❌ Error durante la inyección: {e}")
        # En scripts de seed, a veces preferimos db.rollback() para atomicidad
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_injuries()

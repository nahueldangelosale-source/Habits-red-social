# backend/scripts/seed_onboarding_tags.py
import os
import sys
import csv
from typing import List

# Añadir el path raíz para poder importar app
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_path)
os.chdir(backend_path)  # Asegurar que Pydantic encuentre el .env

from app.db.database import sync_engine, Base
from app.db.models import OnboardingTag

CSV_FILE = "Tag Onboarding - Investigación Completada.csv"

def seed_onboarding_tags():
    # Ruta absoluta al CSV
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_path, CSV_FILE)
    
    print(f"🔍 Buscando CSV en: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: Archivo {csv_path} no encontrado.")
        return

    from app.config import get_settings
    settings = get_settings()
    
    # Parchear SSL para psycopg2 (sync)
    sync_url = settings.database_url.replace("+asyncpg", "").replace("ssl=require", "sslmode=require")
    
    from sqlalchemy import create_engine
    temp_sync_engine = create_engine(sync_url)
    
    print("🛠️ Verificando esquema de base de datos...")
    Base.metadata.create_all(bind=temp_sync_engine, tables=[OnboardingTag.__table__])

    from sqlalchemy.orm import sessionmaker
    temp_session_maker = sessionmaker(bind=temp_sync_engine, expire_on_commit=False)
    db = temp_session_maker()
    
    try:
        # Usamos utf-8-sig para manejar posibles BOM de Excel
        with open(csv_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                id_tag = row.get('ID_Tag')
                if not id_tag:
                    continue
                    
                # Buscar existente para Upsert
                existing = db.query(OnboardingTag).filter(OnboardingTag.id_tag == id_tag).first()
                
                # Mapeo según estructura del CSV
                data = {
                    "category": row.get('Categoria'),
                    "ui_text": row.get('Texto_Boton_UI'),
                    "backend_value": row.get('Backend_Value'),
                    "algorithm_impact": row.get('Impacto_Algoritmo'),
                    "target_user": row.get('Target_Usuario'),
                }
                
                if existing:
                    for key, value in data.items():
                        setattr(existing, key, value)
                else:
                    new_tag = OnboardingTag(
                        id_tag=id_tag,
                        **data
                    )
                    db.add(new_tag)
                
                count += 1
            
            db.commit()
            print(f"✅ Diccionario de Onboarding inyectado exitosamente. Total: {count} tags.")
            
    except Exception as e:
        print(f"❌ Error durante la inyección: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_onboarding_tags()

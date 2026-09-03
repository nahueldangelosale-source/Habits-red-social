import asyncio
import os
import sys
import pandas as pd
from uuid import uuid4

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import delete
from app.db.database import async_session_maker
from app.db.models import SaraFoodItem

def clean_float(val):
    if pd.isna(val):
        return 0.0
    val_str = str(val).lower()
    if val_str in ['tr', 'nd', 'nan', '<0.1']:
        return 0.0
    try:
        return float(val)
    except ValueError:
        return 0.0

async def inject_database():
    print("Iniciando Inyección de Datos SARA 2 y Custom Suplementos (ASINCRONA)...")
    
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "Alimentos")
    sara_path = os.path.join(docs_dir, "SARA_Master_Database.csv")
    custom_path = os.path.join(docs_dir, "SARA_Custom_Suplementos.csv")
    
    async with async_session_maker() as db:
        try:
            # Borrar tabla entera
            await db.execute(delete(SaraFoodItem))
            await db.commit()
            print("Tabla sara_food_items limpiada.")
            
            items_to_insert = []
            
            # 1. Ingesta SARA Oficial
            if os.path.exists(sara_path):
                df_sara = pd.read_csv(sara_path)
                for _, row in df_sara.iterrows():
                    cho_av = clean_float(row.get('CHOAVLDF'))
                    cho_tot = clean_float(row.get('CHOCDF'))
                    final_carbs = cho_av if cho_av > 0 else cho_tot
                    
                    categoria = str(row.get('origen_categoria', 'SARA_Oficial')).replace('.xls', '')
                    
                    item = SaraFoodItem(
                        id=uuid4(),
                        name=str(row['Alimento']).strip(),
                        category=categoria,
                        energy_kcal=clean_float(row.get('ENERC_KCAL')),
                        protein_g=clean_float(row.get('PROTCNT')),
                        total_fat_g=clean_float(row.get('FAT')),
                        available_carbs_g=final_carbs,
                        dietary_fiber_g=clean_float(row.get('FIBTG')),
                        sodium_mg=clean_float(row.get('Sodiomg')),
                        is_cooked=False
                    )
                    items_to_insert.append(item)
                print(f"SARA Oficial: {len(df_sara)} alimentos listos.")
                
            # 2. Ingesta Suplementos Custom
            if os.path.exists(custom_path):
                df_custom = pd.read_csv(custom_path)
                for _, row in df_custom.iterrows():
                    item = SaraFoodItem(
                        id=uuid4(),
                        name=str(row['Alimento']).strip(),
                        category='Ultra_Procesados_Custom',
                        energy_kcal=clean_float(row.get('ENERC_KCAL')),
                        protein_g=clean_float(row.get('PROTCNT')),
                        total_fat_g=clean_float(row.get('FAT')),
                        available_carbs_g=clean_float(row.get('CHOAVLDF')),
                        dietary_fiber_g=clean_float(row.get('FIBTG')),
                        sodium_mg=clean_float(row.get('Sodiomg')),
                        is_cooked=False
                    )
                    items_to_insert.append(item)
                print(f"Suplementos Custom: {len(df_custom)} alimentos listos.")
                
            # Bulk Insert
            db.add_all(items_to_insert)
            await db.commit()
            print(f"¡ÉXITO! {len(items_to_insert)} alimentos inyectados en PostgreSQL.")
            
        except Exception as e:
            await db.rollback()
            print(f"Error durante la inyección: {e}")

if __name__ == "__main__":
    asyncio.run(inject_database())

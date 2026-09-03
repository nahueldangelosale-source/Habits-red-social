import asyncio
import csv
import json
import uuid
import os
import sys

# Add backend to path so imports work
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.database import async_session_maker
from app.db.models import ExerciseTemplate, Tenant
from sqlalchemy import select

async def seed_taxonomy():
    csv_path = os.path.join(os.path.dirname(__file__), '..', '_Taxonomía de Ejercicios.csv')
    
    async with async_session_maker() as session:
        # Get or create a system tenant for these global templates
        result = await session.execute(select(Tenant).where(Tenant.slug == "system-global"))
        tenant = result.scalars().first()
        if not tenant:
            tenant = Tenant(id=uuid.uuid4(), name="System Global", slug="system-global")
            session.add(tenant)
            await session.commit()
            
        print(f"Using Tenant: {tenant.id}")

        with open(csv_path, mode='r', encoding='utf-8') as f:
            lines = f.readlines()
            
        import io
        # El CSV tiene CADA LÍNEA entera entre comillas dobles, y adentro usa "" para comillas dobles.
        # Quitamos la comilla inicial y final de cada línea, y reemplazamos "" por "
        fixed_lines = []
        for line in lines:
            line = line.strip()
            if line.startswith('"') and line.endswith('"'):
                line = line[1:-1]
            line = line.replace('""', '"')
            fixed_lines.append(line)
            
        reader = csv.DictReader(io.StringIO('\n'.join(fixed_lines)))
        
        # Eliminar registros previos para no duplicar en re-runs del spike
        await session.execute(ExerciseTemplate.__table__.delete())
        
        count = 0
        for row in reader:
            # Mapeo a JSONB estructurado (aurea_metadata)
            aurea_meta = {
                "official_id": row.get("ID_Ejercicio", ""),
                "alias": row.get("Alias_Buscador", ""),
                "movement_pattern": row.get("Patron_Movimiento", ""),
                "laterality": row.get("Lateralidad", ""),
                "synergist_muscles": row.get("Musculos_Sinergistas", "").split(",") if row.get("Musculos_Sinergistas") else [],
                "equipment": row.get("Equipamiento_Requerido", ""),
                "skill_level": row.get("Nivel_Habilidad", ""),
                "joint_impact": row.get("Nivel_Impacto_Articular", "")
            }
            
            ex = ExerciseTemplate(
                id=uuid.uuid4(),
                name=row.get("Nombre_Oficial", "Unknown"),
                primary_muscle_group=row.get("Musculo_Agonista", ""),
                axial_load=True if row.get("Carga_Axial", "").strip().upper() in ["SÍ", "SI", "TRUE", "YES"] else False,
                is_glp1_safe=True, # Por defecto verdadero, luego la IA muta
                contraindications=[], # Para la matriz
                aurea_metadata=aurea_meta
            )
            session.add(ex)
            count += 1
                
        await session.commit()
        print(f"Successfully seeded {count} exercises into PostgreSQL JSONB.")

if __name__ == "__main__":
    asyncio.run(seed_taxonomy())

import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.connection import async_session_maker
from app.db.models import Exercise

# DATA LOTE 1 (Tren Inferior & Core) - Biomechanical Taxonomy
EXERCISES_DATA = [
  {
    "id": uuid.UUID("51c6a7a1-0001-4000-8000-000000000001"), # SQUAT_001
    "nombre_oficial": "Sentadilla con Barra Trasera (High Bar)",
    "alias_buscador": "Back Squat, Sentadilla Olimpica",
    "patron_movimiento": "Dominante de Rodilla",
    "lateralidad": "Bilateral",
    "carga_axial": True,
    "musculo_agonista": "Cuádriceps",
    "musculos_sinergistas": ["Glúteo Mayor", "Erectores Espinales", "Aductores"],
    "equipamiento_requerido": ["Barra", "Racks", "Discos"],
    "nivel_habilidad": 4,
    "nivel_impacto_articular": "Medio"
  },
  {
    "id": uuid.UUID("51c6a7a1-0001-4000-8000-000000000002"), # SQUAT_004
    "nombre_oficial": "Prensa de Piernas 45 Grados",
    "alias_buscador": "Leg Press, Prensa Inclinada",
    "patron_movimiento": "Dominante de Rodilla",
    "lateralidad": "Bilateral",
    "carga_axial": False,
    "musculo_agonista": "Cuádriceps",
    "musculos_sinergistas": ["Glúteo Mayor", "Isquiotibiales"],
    "equipamiento_requerido": ["Máquina de Prensa"],
    "nivel_habilidad": 1,
    "nivel_impacto_articular": "Bajo"
  },
  {
    "id": uuid.UUID("51c6a7a1-0001-4000-8000-000000000003"), # SQUAT_006
    "nombre_oficial": "Sentadilla a una Pierna (Pistol Squat)",
    "alias_buscador": "Pistol Squat, Single Leg Squat",
    "patron_movimiento": "Dominante de Rodilla",
    "lateralidad": "Unilateral",
    "carga_axial": False,
    "musculo_agonista": "Cuádriceps",
    "musculos_sinergistas": ["Glúteo Medio", "Núcleo (Core)", "Flexores de Cadera"],
    "equipamiento_requerido": ["Peso Corporal"],
    "nivel_habilidad": 5,
    "nivel_impacto_articular": "Alto"
  },
  {
    "id": uuid.UUID("51c6a7a1-0002-4000-8000-000000000001"), # HINGE_001
    "nombre_oficial": "Peso Muerto Convencional",
    "alias_buscador": "Deadlift, Peso Muerto con Barra",
    "patron_movimiento": "Bisagra de Cadera",
    "lateralidad": "Bilateral",
    "carga_axial": True,
    "musculo_agonista": "Cadena Posterior (Isquiotibiales/Glúteos)",
    "musculos_sinergistas": ["Erectores Espinales", "Trapecio", "Antebrazos"],
    "equipamiento_requerido": ["Barra", "Discos"],
    "nivel_habilidad": 4,
    "nivel_impacto_articular": "Medio-Alto"
  },
  {
    "id": uuid.UUID("51c6a7a1-0002-4000-8000-000000000002"), # HINGE_005
    "nombre_oficial": "Puente de Glúteo (Hip Thrust)",
    "alias_buscador": "Hip Thrust, Empuje de Cadera",
    "patron_movimiento": "Bisagra de Cadera",
    "lateralidad": "Bilateral",
    "carga_axial": False,
    "musculo_agonista": "Glúteo Mayor",
    "musculos_sinergistas": ["Isquiotibiales", "Core"],
    "equipamiento_requerido": ["Barra", "Banco", "Pad"],
    "nivel_habilidad": 2,
    "nivel_impacto_articular": "Bajo"
  },
  {
    "id": uuid.UUID("51c6a7a1-0003-4000-8000-000000000001"), # CORE_001
    "nombre_oficial": "Plancha Frontal Isométrica",
    "alias_buscador": "Plank, Estabilidad de Núcleo",
    "patron_movimiento": "Antiextensión de Tronco",
    "lateralidad": "N/A",
    "carga_axial": False,
    "musculo_agonista": "Recto Abdominal",
    "musculos_sinergistas": ["Oblicuos", "Serrato Anterior", "Cuádriceps"],
    "equipamiento_requerido": ["Peso Corporal"],
    "nivel_habilidad": 1,
    "nivel_impacto_articular": "Bajo"
  }
]

async def seed_exercises():
    print("🚀 Iniciando inyección quirúrgica de ejercicios Lote 1...")
    async with async_session_maker() as db:
        for data in EXERCISES_DATA:
            # Upsert logic based on id
            existing = await db.get(Exercise, data["id"])
            if existing:
                print(f"♻️  Actualizando: {data['nombre_oficial']}")
                for key, value in data.items():
                    setattr(existing, key, value)
            else:
                print(f"✅ Creando: {data['nombre_oficial']}")
                db.add(Exercise(**data))
        
        await db.commit()
    print("✨ Inyección completada con éxito.")

if __name__ == "__main__":
    asyncio.run(seed_exercises())

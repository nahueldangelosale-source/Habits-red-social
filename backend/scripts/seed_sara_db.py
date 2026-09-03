import asyncio
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.db.models import SaraFoodItem
from app.db.database import async_session_maker

SARA_SEED_DATA = [
    {
        "name": "Brócoli, crudo", "category": "Vegetales Fibrosos",
        "energy_kcal": 27.0, "water_g": 89.9, "protein_g": 3.3,
        "available_carbs_g": 2.9, "total_fat_g": 0.2, "dietary_fiber_g": 2.6,
        "is_cooked": False
    },
    {
        "name": "Espinaca, cruda", "category": "Vegetales Fibrosos",
        "energy_kcal": 21.0, "water_g": 91.4, "protein_g": 2.86,
        "available_carbs_g": 1.43, "total_fat_g": 0.39, "dietary_fiber_g": 2.2,
        "is_cooked": False
    },
    {
        "name": "Acelga, cruda", "category": "Vegetales Fibrosos",
        "energy_kcal": 18.0, "water_g": 92.7, "protein_g": 1.8,
        "available_carbs_g": 2.1, "total_fat_g": 0.2, "dietary_fiber_g": 1.6,
        "is_cooked": False
    },
    {
        "name": "Lechuga, cruda", "category": "Vegetales Fibrosos",
        "energy_kcal": 12.0, "water_g": 95.22, "protein_g": 1.2,
        "available_carbs_g": 1.4, "total_fat_g": 0.2, "dietary_fiber_g": 1.4,
        "is_cooked": False
    },
    {
        "name": "Pollo, pechuga sin piel, crudo", "category": "Proteína de Élite",
        "energy_kcal": 114.0, "water_g": 73.9, "protein_g": 22.5,
        "available_carbs_g": 0.0, "total_fat_g": 2.6, "dietary_fiber_g": 0.0,
        "is_cooked": False
    },
    {
        "name": "Huevo de gallina, entero, crudo", "category": "Proteína de Élite",
        "energy_kcal": 156.0, "water_g": 74.9, "protein_g": 12.0,
        "available_carbs_g": 0.4, "total_fat_g": 11.8, "dietary_fiber_g": 0.0,
        "is_cooked": False
    },
    {
        "name": "Surubí, crudo", "category": "Proteína de Élite",
        "energy_kcal": 110.0, "water_g": 76.5, "protein_g": 18.2,
        "available_carbs_g": 0.2, "total_fat_g": 4.0, "dietary_fiber_g": 0.0,
        "is_cooked": False
    },
    {
        "name": "Arroz integral, hervido", "category": "Carbohidratos Complejos",
        "energy_kcal": 116.0, "water_g": 70.3, "protein_g": 2.7,
        "available_carbs_g": 24.0, "total_fat_g": 1.0, "dietary_fiber_g": 1.6,
        "is_cooked": True
    },
    {
        "name": "Lentejas, hervidas", "category": "Carbohidratos Complejos",
        "energy_kcal": 88.0, "water_g": 69.6, "protein_g": 9.0,
        "available_carbs_g": 12.2, "total_fat_g": 0.4, "dietary_fiber_g": 7.9,
        "is_cooked": True
    },
    {
        "name": "Quinoa, semilla, hervida", "category": "Carbohidratos Complejos",
        "energy_kcal": 109.0, "water_g": 71.6, "protein_g": 4.4,
        "available_carbs_g": 18.5, "total_fat_g": 1.9, "dietary_fiber_g": 2.8,
        "is_cooked": True
    }
]

async def seed_sara_foods():
    print("Iniciando conexión a DB...")
    
    async with async_session_maker() as session:
        for item_data in SARA_SEED_DATA:
            stmt = select(SaraFoodItem).where(SaraFoodItem.name == item_data["name"])
            result = await session.execute(stmt)
            existing = result.scalars().first()
            
            if not existing:
                food_item = SaraFoodItem(
                    id=uuid.uuid4(),
                    name=item_data["name"],
                    category=item_data["category"],
                    energy_kcal=item_data.get("energy_kcal", 0.0),
                    water_g=item_data.get("water_g", 0.0),
                    protein_g=item_data.get("protein_g", 0.0),
                    available_carbs_g=item_data.get("available_carbs_g", 0.0),
                    total_fat_g=item_data.get("total_fat_g", 0.0),
                    dietary_fiber_g=item_data.get("dietary_fiber_g", 0.0),
                    is_cooked=item_data.get("is_cooked", False)
                )
                session.add(food_item)
                print(f"[CREATED] {item_data['name']}")
            else:
                print(f"[EXISTS] {item_data['name']}")
                
        await session.commit()
    
    print("Seed finalizado con éxito.")

if __name__ == "__main__":
    asyncio.run(seed_sara_foods())

import asyncio
import logging
from neo4j import AsyncGraphDatabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "bienestar_dev_2026"

async def seed_graph():
    driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    # Intentamos conectar y hacer wipe de la DB
    async with driver.session() as session:
        logger.info("🗑️ Limpiando la base de datos de Neo4j...")
        await session.run("MATCH (n) DETACH DELETE n")
        
        logger.info("🌱 Sembrando Tags Clínicos y Dietéticos...")
        tags = [
            "Low-FODMAP", "Cero Lácteos", "Sin Gluten", "Vegano", "Keto", "Hipertensión"
        ]
        for tag in tags:
            await session.run("CREATE (t:Tag {name: $name})", name=tag)

        logger.info("🌱 Sembrando Ingredientes y Alternativas (Bypass IA)...")
        # Ingredientes
        await session.run("""
        CREATE 
            (i1:Ingredient {name: 'Mantequilla', category: 'Dairy'}),
            (i2:Ingredient {name: 'Ghee', category: 'Fat'}),
            (i3:Ingredient {name: 'Ajo', category: 'Vegetable'}),
            (i4:Ingredient {name: 'Aceite de Oliva Infusionado', category: 'Fat'}),
            (i5:Ingredient {name: 'Trigo', category: 'Grain'}),
            (i6:Ingredient {name: 'Quinoa', category: 'Grain'}),
            (i7:Ingredient {name: 'Sal', category: 'Mineral'}),
            (i8:Ingredient {name: 'Pollo', category: 'Meat'}),
            (i9:Ingredient {name: 'Tofu', category: 'Plant Protein'})
        """)
        
        # Relaciones ALTERNATIVE_TO (Esta es la magia para ahorrar tokens)
        await session.run("""
        MATCH (i1:Ingredient {name: 'Mantequilla'}), (i2:Ingredient {name: 'Ghee'})
        CREATE (i1)-[:ALTERNATIVE_TO {diet: 'Cero Lácteos'}]->(i2)
        """)
        
        await session.run("""
        MATCH (i3:Ingredient {name: 'Ajo'}), (i4:Ingredient {name: 'Aceite de Oliva Infusionado'})
        CREATE (i3)-[:ALTERNATIVE_TO {type: 'Low-FODMAP'}]->(i4)
        """)
        
        await session.run("""
        MATCH (i5:Ingredient {name: 'Trigo'}), (i6:Ingredient {name: 'Quinoa'})
        CREATE (i5)-[:ALTERNATIVE_TO {diet: 'Sin Gluten'}]->(i6)
        """)
        
        await session.run("""
        MATCH (i8:Ingredient {name: 'Pollo'}), (i9:Ingredient {name: 'Tofu'})
        CREATE (i8)-[:ALTERNATIVE_TO {diet: 'Vegano'}]->(i9)
        """)

        logger.info("🌱 Sembrando Recetas Edge-Cases...")
        # Receta 1: Sano pero choca con Low-FODMAP y Vegano (Pollo al Ajo)
        await session.run("""
        MATCH (pollo:Ingredient {name: 'Pollo'}), (ajo:Ingredient {name: 'Ajo'})
        CREATE (r:Recipe {id: 'REC_001', name: 'Pollo al Ajo Asado', type: 'Lunch', prep_time: 30, calories: 450, protein: 40, carbs: 10, fats: 15})
        CREATE (r)-[:CONTAINS]->(pollo)
        CREATE (r)-[:CONTAINS]->(ajo)
        """)
        
        # Receta 2: Keto pero choca con Cero Lácteos (Salmón a la Mantequilla)
        await session.run("""
        MATCH (mant:Ingredient {name: 'Mantequilla'})
        MATCH (t1:Tag {name: 'Keto'})
        CREATE (r:Recipe {id: 'REC_002', name: 'Salmón a la Mantequilla', type: 'Dinner', prep_time: 20, calories: 500, protein: 35, carbs: 2, fats: 38})
        CREATE (r)-[:CONTAINS]->(mant)
        CREATE (r)-[:HAS_TAG]->(t1)
        """)

        # Receta 3: Receta Segura (Ensalada de Quinoa con Tofu - Vegano, Sin Gluten, Low-FODMAP, Sin Lácteos)
        await session.run("""
        MATCH (quinoa:Ingredient {name: 'Quinoa'}), (tofu:Ingredient {name: 'Tofu'}), (aceite:Ingredient {name: 'Aceite de Oliva Infusionado'})
        MATCH (t1:Tag {name: 'Vegano'}), (t2:Tag {name: 'Sin Gluten'}), (t3:Tag {name: 'Low-FODMAP'}), (t4:Tag {name: 'Cero Lácteos'})
        CREATE (r:Recipe {id: 'REC_003', name: 'Bowl de Quinoa y Tofu', type: 'Lunch', prep_time: 15, calories: 400, protein: 25, carbs: 45, fats: 12})
        CREATE (r)-[:CONTAINS]->(quinoa)
        CREATE (r)-[:CONTAINS]->(tofu)
        CREATE (r)-[:CONTAINS]->(aceite)
        CREATE (r)-[:HAS_TAG]->(t1)
        CREATE (r)-[:HAS_TAG]->(t2)
        CREATE (r)-[:HAS_TAG]->(t3)
        CREATE (r)-[:HAS_TAG]->(t4)
        """)
        
        # Receta 4: Alta en Sodio (Peligro Hipertensión)
        await session.run("""
        MATCH (sal:Ingredient {name: 'Sal'})
        CREATE (r:Recipe {id: 'REC_004', name: 'Sopa de Miso Tradicional', type: 'Dinner', prep_time: 10, calories: 150, protein: 10, carbs: 15, fats: 5, high_sodium: true})
        CREATE (r)-[:CONTAINS]->(sal)
        """)

    logger.info("✅ Base de datos Neo4j sembrada exitosamente con Edge Cases.")
    await driver.close()

if __name__ == "__main__":
    asyncio.run(seed_graph())

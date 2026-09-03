import sys
import os
import csv
import json
from pathlib import Path

# Add the backend directory to sys.path to resolve imports correctly
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.db.connection import sync_engine, Base, sync_session_maker
from app.db.models import Exercise

def generate_contraindications(axial_load, joint_impact, movement_pattern):
    """
    Generates an array of contraindication tags based on the exercise attributes.
    """
    tags = []
    
    # If it has axial load, it's contraindicated for inj_lower_back
    if axial_load.strip().upper() == "SÍ" or axial_load.strip() == "1":
        tags.append("inj_lower_back")
        
    # High joint impact or specific knee dominant may contraindicate for inj_knees
    if joint_impact.strip().upper() == "ALTO":
        tags.append("inj_knees")
        # Also could be bad for shoulders if it's upper body plyo, but we'll stick to basic mapping
        
    if "Rodilla" in movement_pattern and joint_impact.strip().upper() in ["MEDIO", "ALTO"]:
         # We'll make a softer assumption, SQUATS with Axial load might be bad for knees too.
         if "inj_knees" not in tags and axial_load.strip().upper() == "SÍ":
            tags.append("inj_knees")

    # If it's heavy vertical pushing, bad for bad shoulders
    if "Vertical" in movement_pattern and "Empuje" in movement_pattern:
        tags.append("inj_shoulders")
        
    return tags

def determine_mechanic(movement_pattern):
    """
    Infer if an exercise is compound or isolation based on movement pattern.
    """
    if "Aislamiento" in movement_pattern:
        return "isolation"
    return "compound"

def seed_catalog():
    print("=== NUTRITION/FITNESS KINETIC GRAPH-RAG SEEDER ===")
    
    # Ensure tables exist
    print("Ensuring tables exist...")
    Base.metadata.create_all(bind=sync_engine)
    
    # Path to the business context document
    docs_path = backend_dir.parent / "docs" / "business_context" / "01_pt_gym" / "conocimiento_pt_gym_complet.md"
    
    if not docs_path.exists():
        print(f"ERROR: Could not find business context file at {docs_path}")
        return
        
    print(f"Reading documentation from {docs_path.name}...")
    
    # Extract the CSV portion for exercises
    csv_lines = []
    in_exercise_block = False
    
    with open(docs_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("ID_Ejercicio,Nombre_Oficial"):
                in_exercise_block = True
                csv_lines.append(line.strip())
                continue
                
            if in_exercise_block:
                if not line.strip() or line.startswith("---") or line.startswith("#"):
                    if not line.strip():
                        # Sometimes there are blank lines in the CSV, but let's assume end if we hit ---
                        pass
                    if line.startswith("---") or line.startswith("#"):
                        in_exercise_block = False
                        break
                elif "," in line:
                    csv_lines.append(line.strip())

    if not csv_lines:
        print("ERROR: Could not extract CSV data from the markdown file.")
        return
        
    print(f"Extracted {len(csv_lines)} lines of CSV data.")
    
    # Parse CSV
    reader = csv.DictReader(csv_lines)
    exercises_to_insert = []
    
    for row in reader:
        try:
            ex_id = row["ID_Ejercicio"]
            name = row["Nombre_Oficial"]
            aliases = row.get("Alias_Buscador", "")
            pattern = row.get("Patron_Movimiento", "Unknown")
            lateral = row.get("Lateralidad", "Bilateral")
            axial = row.get("Carga_Axial", "NO")
            prim_muscle = row.get("Musculo_Agonista", "Unknown")
            syn_muscles = [m.strip() for m in row.get("Musculos_Sinergistas", "").split(",") if m.strip()]
            equip = [e.strip() for e in row.get("Equipamiento_Requerido", "").split(",") if e.strip()]
            skill = int(row.get("Nivel_Habilidad", "1"))
            impact = row.get("Nivel_Impacto_Articular", "Bajo")
            
            axial_bool = (axial.upper() == "SÍ" or axial == "1")
            mechanic = determine_mechanic(pattern)
            contraindications = generate_contraindications(axial, impact, pattern)
            
            exercises_to_insert.append({
                "exercise_id": ex_id,
                "official_name": name,
                "search_aliases": aliases,
                "movement_pattern": pattern,
                "laterality": lateral,
                "axial_load": axial_bool,
                "primary_muscle": prim_muscle,
                "synergist_muscles": syn_muscles,
                "equipment_required": equip,
                "skill_level": skill,
                "joint_impact": impact,
                "mechanic": mechanic,
                "contraindications": contraindications
            })
        except Exception as e:
            print(f"Error parsing row: {row}. Error: {e}")
            
    print(f"Parsed {len(exercises_to_insert)} valid exercises. Upserting into database...")
    
    # Use Session to upsert
    db = sync_session_maker()
    try:
        upserted_count = 0
        for data in exercises_to_insert:
            # Check if exists
            existing = db.query(Exercise).filter(Exercise.exercise_id == data["exercise_id"]).first()
            if existing:
                # Update
                for key, value in data.items():
                    setattr(existing, key, value)
            else:
                # Insert
                new_ex = Exercise(**data)
                db.add(new_ex)
            upserted_count += 1
            
            if upserted_count % 50 == 0:
                db.commit()
                print(f"Committed {upserted_count} records...")
                
        db.commit()
        print(f"SUCCESS: {upserted_count} exercises have been synced to the database.")
        
    except Exception as e:
        print(f"Database error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_catalog()

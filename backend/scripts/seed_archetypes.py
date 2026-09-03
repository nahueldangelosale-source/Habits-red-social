import sys
import csv
from io import StringIO
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.db.connection import sync_engine, Base, sync_session_maker
from app.db.models import TrainingArchetype

def parse_range(range_str):
    # e.g., "3", "2 a 3", "3 a 5", "1 al 3"
    parts = range_str.split(" a ")
    if len(parts) == 1:
        parts = parts[0].split(" al ")
    
    if len(parts) == 1:
        return int(parts[0]), int(parts[0])
    return int(parts[0]), int(parts[1])

def seed_archetypes():
    # Ensure tables exist
    print("Ensuring tables exist...")
    Base.metadata.create_all(bind=sync_engine)
    
    docs_path = backend_dir.parent / "docs" / "business_context" / "01_pt_gym" / "conocimiento_pt_gym_complet.md"
    
    if not docs_path.exists():
        print(f"Error: Could not find business context document at {docs_path}")
        return

    content = docs_path.read_text(encoding="utf-8")
    
    # Simple parsing: find the CSV block
    lines = content.split('\n')
    csv_data = []
    in_csv = False
    for line in lines:
        if line.startswith("ID_Arquetipo"):
            in_csv = True
        
        if in_csv:
            if not line.strip() or line.startswith("ID_Ejercicio"):
                break
            csv_data.append(line)
            
    if not csv_data:
        print("Could not find archetype CSV data in markdown.")
        return

    header = csv_data[0]
    expected_header = "ID_Arquetipo,Nombre_Comercial,Dias_Por_Semana,Nivel_Experiencia_Requerido,Objetivo_Principal,Perfil_Psicografico"
    if header != expected_header:
        print(f"CSV Header mismatch. Expected: {expected_header}\nGot: {header}")
        return
        
    f = StringIO('\n'.join(csv_data))
    reader = csv.DictReader(f)
    
    records = []
    for row in reader:
        # Dias_Por_Semana -> days_per_week_min/max
        dmin, dmax = parse_range(row['Dias_Por_Semana'])
        
        # Nivel_Experiencia_Requerido -> exp_level_min/max
        emin, emax = parse_range(row['Nivel_Experiencia_Requerido'])
        
        records.append({
            "id": row['ID_Arquetipo'],
            "name": row['Nombre_Comercial'],
            "days_per_week_min": dmin,
            "days_per_week_max": dmax,
            "exp_level_min": emin,
            "exp_level_max": emax,
            "primary_goal": row['Objetivo_Principal'],
            "psychographic_profile": row['Perfil_Psicografico']
        })

    db = sync_session_maker()
    try:
        updated = 0
        for data in records:
            existing = db.query(TrainingArchetype).filter(TrainingArchetype.id == data['id']).first()
            if existing:
                for k, v in data.items():
                    setattr(existing, k, v)
                updated += 1
            else:
                arch = TrainingArchetype(**data)
                db.add(arch)
                updated += 1
        db.commit()
        print(f"Seeded {updated} archetypes successfully.")
    except Exception as e:
        db.rollback()
        print(f"Failed to seed archetypes: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_archetypes()

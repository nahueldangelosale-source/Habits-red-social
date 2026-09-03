import io

def fix_file(filepath):
    with io.open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    content = content.replace('from app.db.connection import get_db_session', 'from app.db.connection import get_db')
    content = content.replace('Depends(get_db_session)', 'Depends(get_db)')

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('D:/Musica Descargada/Bienestar APP/backend/app/api/nutrition_plans.py')
fix_file('D:/Musica Descargada/Bienestar APP/backend/app/api/recipes.py')

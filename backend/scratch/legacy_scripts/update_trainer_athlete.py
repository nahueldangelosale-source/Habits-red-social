import io
import re

def update_file():
    filepath = 'D:/Musica Descargada/Bienestar APP/backend/app/api/trainer_routes.py'
    with io.open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Import NutritionPlan
    if 'NutritionPlan' not in content:
        content = content.replace('from app.db.models import Client, VideoReview', 'from app.db.models import Client, VideoReview, NutritionPlan')

    # Add nutrition plan query
    if 'active_nutrition =' not in content:
        injection = '''
    # Fetch active nutrition plan
    nutrition_res = await db.execute(
        select(NutritionPlan)
        .where(NutritionPlan.client_id == athlete_id, NutritionPlan.is_active == True)
        .order_by(NutritionPlan.created_at.desc())
        .limit(1)
    )
    active_nutrition = nutrition_res.scalar_one_or_none()
    
    nutrition_data = None
    if active_nutrition:
        nutrition_data = {
            "id": str(active_nutrition.id),
            "macros": active_nutrition.macros,
            "recipes": [] # Could fetch actual recipes here
        }
        '''
        
        content = content.replace('videos = extra.get("videos", [])', 'videos = extra.get("videos", [])\n' + injection)

    # Return nutrition data
    if '"nutrition": nutrition_data' not in content:
        content = content.replace('"acwr_data": acwr_data', '"acwr_data": acwr_data,\n        "nutrition": nutrition_data')

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        print('trainer_routes.py updated successfully.')

update_file()

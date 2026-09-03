import io

def update_file():
    filepath = 'D:/Musica Descargada/Bienestar APP/backend/app/api/nutrition.py'
    
    new_content = '''

from app.db.models import NutritionPlan, Recipe

class RecipeCreate(BaseModel):
    title: str
    ingredients: list
    macros: dict
    instructions: str = None
    tags: list = []

@router.get("/plans")
async def get_nutrition_plans(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = select(NutritionPlan).where(NutritionPlan.tenant_id == current_user.tenant_id)
    result = await db.execute(query)
    plans = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "title": p.title,
            "client_id": p.client_id,
            "daily_macros_target": p.daily_macros_target
        } for p in plans
    ]

@router.post("/recipes")
async def create_recipe(
    recipe: RecipeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    new_recipe = Recipe(
        tenant_id=current_user.tenant_id,
        professional_id=current_user.id,
        title=recipe.title,
        ingredients=recipe.ingredients,
        macros=recipe.macros,
        instructions=recipe.instructions,
        tags=recipe.tags
    )
    db.add(new_recipe)
    await db.commit()
    await db.refresh(new_recipe)
    
    return {
        "id": new_recipe.id,
        "title": new_recipe.title,
        "ingredients": new_recipe.ingredients,
        "macros": new_recipe.macros
    }
'''
    with io.open(filepath, 'a', encoding='utf-8') as f:
        f.write(new_content)
    print("nutrition endpoints appended.")

update_file()

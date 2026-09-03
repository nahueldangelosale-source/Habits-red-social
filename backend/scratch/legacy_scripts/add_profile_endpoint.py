import io

def update_file():
    filepath = 'D:/Musica Descargada/Bienestar APP/backend/app/api/athlete.py'
    with io.open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    new_endpoint = '''
@router.get("/profile")
async def get_athlete_profile(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    \"\"\"
    Get consolidated profile for the athlete (coach view context).
    Includes biometrics from extra_data, training stats, but NO gamification.
    \"\"\"
    client_id = current_user.user_id
    
    result = await db.execute(
        select(Client).where(Client.id == client_id)
    )
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Athlete not found")
        
    extra_data = client.extra_data or {}
    biometrics = extra_data.get("biometrics", {})
    
    # Simple training stats aggregation (could be expanded)
    # Getting total volume from WorkoutSession
    from app.db.models import WorkoutSession
    session_result = await db.execute(
        select(func.count(WorkoutSession.id), func.sum(WorkoutSession.volume))
        .where(WorkoutSession.client_id == client_id)
    )
    total_sessions, total_volume = session_result.first()
    
    # Getting active nutrition plan
    from app.db.models import NutritionPlan
    nutrition_result = await db.execute(
        select(NutritionPlan)
        .where(NutritionPlan.client_id == client_id, NutritionPlan.is_active == True)
        .order_by(NutritionPlan.created_at.desc())
        .limit(1)
    )
    active_nutrition = nutrition_result.scalar_one_or_none()
    
    return {
        "personal": {
            "first_name": client.first_name,
            "last_name": client.last_name,
            "created_at": client.created_at.isoformat() if client.created_at else None,
            "photo_url": extra_data.get("photo_url")
        },
        "biometrics": {
            "weight": biometrics.get("weight", client.height_cm), # Fallback if weight is not in extra_data
            "height": client.height_cm,
            "body_fat": biometrics.get("body_fat")
        },
        "training": {
            "total_sessions": total_sessions or 0,
            "total_volume": float(total_volume or 0),
            "prs": extra_data.get("prs", [])
        },
        "nutrition": {
            "active_plan_id": str(active_nutrition.id) if active_nutrition else None,
            "macros": active_nutrition.macros if active_nutrition else None
        }
    }
'''
    if 'get_athlete_profile' not in content:
        content = content.replace('from sqlalchemy import select', 'from sqlalchemy import select, func\nfrom app.db.models import WorkoutSession, NutritionPlan')
        content += new_endpoint
        
        with io.open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Endpoint added successfully.')
    else:
        print('Endpoint already exists.')

update_file()

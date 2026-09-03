import os
import re

file_path = r"D:\Musica Descargada\Bienestar APP\backend\app\api\athlete.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace("from fastapi import APIRouter, Depends, HTTPException, status", "from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks")
content = content.replace("from app.services.math_engine import process_completed_set, get_current_e1rm_on_demand", "from app.services.math_engine import get_current_e1rm_on_demand, recalculate_and_cache_e1rm, calculate_brzycki_e1rm")
content = content.replace("from app.db.models import WorkoutSets, AthleteExerciseStats, Client", "from app.db.models import WorkoutSets, AthleteExerciseStats, Client, Protocol")

# 2. Update submit_completed_set
content = re.sub(
    r"async def submit_completed_set\(\s*payload: WorkoutSetCreate,\s*athlete: Client = Depends\(get_current_athlete\),\s*db: AsyncSession = Depends\(get_async_db\)\s*\):",
    "async def submit_completed_set(\n    payload: WorkoutSetCreate,\n    background_tasks: BackgroundTasks,\n    athlete: Client = Depends(get_current_athlete),\n    db: AsyncSession = Depends(get_async_db)\n):",
    content
)

# 3. Replace process_completed_set calls
content = content.replace("fake_e1rm = await process_completed_set(db, athlete.id, payload.exercise_id, payload.actual_weight, payload.actual_reps)", "fake_e1rm = calculate_brzycki_e1rm(payload.actual_weight, payload.actual_reps)")

new_e1rm_block = """    # 3. Trigger the Math Engine (Opción A: solo computa para retornar, sin estado derivado)
    new_e1rm = await process_completed_set(
        db=db,
        athlete_id=athlete.id,
        exercise_id=payload.exercise_id,
        actual_weight=payload.actual_weight,
        actual_reps=payload.actual_reps
    )"""
new_e1rm_replacement = """    # 3. Trigger the Math Engine Background Task
    new_e1rm = calculate_brzycki_e1rm(payload.actual_weight, payload.actual_reps)
    background_tasks.add_task(recalculate_and_cache_e1rm, athlete.id, payload.exercise_id, payload.protocol_id)"""

content = content.replace(new_e1rm_block, new_e1rm_replacement)

# 4. Update get_autoregulated_routine to fetch protocol_id
fetch_protocol = """
    # Fetch active protocol for bounding the context
    protocol_stmt = select(Protocol).where(Protocol.client_id == athlete.id, Protocol.status == "ACTIVE").limit(1)
    protocol_res = await db.execute(protocol_stmt)
    active_protocol = protocol_res.scalar_one_or_none()
    if not active_protocol:
        raise HTTPException(status_code=400, detail="No active training protocol found for athlete.")
"""

content = content.replace(
    '    if athlete.payment_status == "past_due":',
    fetch_protocol + '\n    if athlete.payment_status == "past_due":'
)

# Replace the e1rm lookup to pass active_protocol.id
content = content.replace(
    'live_e1rm = await get_current_e1rm_on_demand(db, athlete.id, px["id"])',
    'live_e1rm = await get_current_e1rm_on_demand(db, athlete.id, px["id"], active_protocol.id)'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied")

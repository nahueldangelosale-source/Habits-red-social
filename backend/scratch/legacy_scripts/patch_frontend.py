import os
import re

# 1. Update athlete.py to return protocol_id
athlete_path = r"D:\Musica Descargada\Bienestar APP\backend\app\api\athlete.py"
with open(athlete_path, "r", encoding="utf-8") as f:
    athlete_content = f.read()

athlete_content = athlete_content.replace(
    "class DailyRoutineResponse(BaseModel):\n    day_name: str\n    exercises: List[AutoRegulatedExercise]",
    "class DailyRoutineResponse(BaseModel):\n    day_name: str\n    protocol_id: Optional[UUID] = None\n    exercises: List[AutoRegulatedExercise]"
)

athlete_content = athlete_content.replace(
    'return DailyRoutineResponse(\n        day_name="Fuerza Máxima (Auto-Regulada)",\n        exercises=regulated_exercises\n    )',
    'return DailyRoutineResponse(\n        day_name="Fuerza Máxima (Auto-Regulada)",\n        protocol_id=active_protocol.id if active_protocol else None,\n        exercises=regulated_exercises\n    )'
)

with open(athlete_path, "w", encoding="utf-8") as f:
    f.write(athlete_content)

# 2. Update offlineSync.ts
sync_path = r"D:\Musica Descargada\Bienestar APP\web\src\services\offlineSync.ts"
with open(sync_path, "r", encoding="utf-8") as f:
    sync_content = f.read()

sync_content = sync_content.replace(
    "  idempotency_key: string;\n}",
    "  idempotency_key: string;\n  protocol_id: string;\n}"
)
sync_content = sync_content.replace(
    "      idempotency_key: idbSet.idempotency_key || idbSet.id // Fallback to id for older sets\n    };",
    "      idempotency_key: idbSet.idempotency_key || idbSet.id, // Fallback to id for older sets\n      protocol_id: idbSet.protocol_id\n    };"
)

with open(sync_path, "w", encoding="utf-8") as f:
    f.write(sync_content)

# 3. Update offlineDb.ts
db_path = r"D:\Musica Descargada\Bienestar APP\web\src\services\offlineDb.ts"
with open(db_path, "r", encoding="utf-8") as f:
    db_content = f.read()

db_content = db_content.replace(
    "  client_created_at: string; // ISO 8601\n  idempotency_key?: string; // Mapeado desde QueuedSet\n  retries: number;\n}",
    "  client_created_at: string; // ISO 8601\n  idempotency_key?: string; // Mapeado desde QueuedSet\n  protocol_id: string;\n  retries: number;\n}"
)

with open(db_path, "w", encoding="utf-8") as f:
    f.write(db_content)

# 4. Update ActiveCanvas.tsx
canvas_path = r"D:\Musica Descargada\Bienestar APP\web\src\components\athlete\ActiveCanvas.tsx"
with open(canvas_path, "r", encoding="utf-8") as f:
    canvas_content = f.read()

# Make useQuery return full response
canvas_content = canvas_content.replace(
    "            const res = await api.get('/api/v1/athlete/routine/today');\n            const exercises = (res as any)?.exercises || [];\n            // Fase 13: Persistir en IndexedDB para offline\n            await saveRoutineToLocal(exercises);\n            return exercises;",
    "            const res = await api.get('/api/v1/athlete/routine/today');\n            // Fase 13: Persistir en IndexedDB para offline\n            await saveRoutineToLocal((res as any)?.exercises || []);\n            return res as any;"
)

# Update the state sync
canvas_content = canvas_content.replace(
    "        if (routineData && routineData.length > 0) {\n            setExercises(routineData);\n            \n            // Only set initial weights if we haven't started interacting with the form\n            if (actualReps === '' && actualWeight === '' && currentIndex === 0) {\n                setActualReps(routineData[0].target_reps);\n                setActualWeight(routineData[0].target_weight);\n            }\n        }",
    "        if (routineData && routineData.exercises && routineData.exercises.length > 0) {\n            setExercises(routineData.exercises);\n            \n            // Only set initial weights if we haven't started interacting with the form\n            if (actualReps === '' && actualWeight === '' && currentIndex === 0) {\n                setActualReps(routineData.exercises[0].target_reps);\n                setActualWeight(routineData.exercises[0].target_weight);\n            }\n        }"
)

# Update handleCompleteSet payload
payload_block = """        const setPayload: QueuedSet = {
            exercise_id: currentEx.exercise_id,
            target_reps: currentEx.target_reps,
            target_weight: currentEx.target_weight,
            actual_reps: Number(actualReps) || currentEx.target_reps,
            actual_weight: Number(actualWeight) || currentEx.target_weight,
            client_created_at,
            idempotency_key: crypto.randomUUID()
        };"""

new_payload_block = """        const setPayload: QueuedSet = {
            exercise_id: currentEx.exercise_id,
            target_reps: currentEx.target_reps,
            target_weight: currentEx.target_weight,
            actual_reps: Number(actualReps) || currentEx.target_reps,
            actual_weight: Number(actualWeight) || currentEx.target_weight,
            client_created_at,
            idempotency_key: crypto.randomUUID(),
            protocol_id: routineData?.protocol_id || '00000000-0000-0000-0000-000000000000'
        };"""

canvas_content = canvas_content.replace(payload_block, new_payload_block)

with open(canvas_path, "w", encoding="utf-8") as f:
    f.write(canvas_content)

print("Frontend patch applied")

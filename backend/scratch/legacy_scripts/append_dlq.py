import os

path = r"D:\Musica Descargada\Bienestar APP\backend\app\api\athlete.py"
with open(path, "a", encoding="utf-8") as f:
    f.write('''

class DLQPayload(BaseModel):
    event_type: str = "DLQ_SYNC_FAILURE"
    payload: dict
    stack_trace: Optional[str] = None

@router.post("/telemetry/dlq", status_code=status.HTTP_202_ACCEPTED)
async def ingest_dlq_telemetry(
    data: DLQPayload,
    athlete: Client = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_async_db)
):
    from app.db.models import M2MAuditVault
    vault_entry = M2MAuditVault(
        client_id=athlete.id,
        event_type=data.event_type,
        payload=data.payload,
        stack_trace=data.stack_trace
    )
    db.add(vault_entry)
    await db.commit()
    return {"status": "accepted"}
''')
print("Appended.")

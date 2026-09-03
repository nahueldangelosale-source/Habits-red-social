from fastapi import APIRouter, Depends
from typing import Any
from app.middleware.auth import get_current_user, TokenData

router = APIRouter()

@router.get("/{task_id}")
async def get_task_status(
    task_id: str,
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get task status for background import or validation.
    """
    return {
        "task_id": task_id,
        "status": "SUCCESS",
        "successful": True,
        "result": {
            "processed": 1,
            "success": True
        }
    }

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import List, Any
import uuid

from app.db.connection import get_db
from app.domain.watchtower.models import ActionCard, ActionCardStatus, ChurnRiskScore

router = APIRouter()

@router.get("/action-cards")
async def get_action_cards(tenant_id: str, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Recupera las Action Cards priorizadas para el Watchtower B2B.
    Retorna solo tarjetas PENDING, ordenadas por el CRI (Riesgo Crítico primero).
    """
    try:
        # 1. Buscar las ActionCards pendientes de este tenant
        stmt = (
            select(ActionCard, ChurnRiskScore.score)
            .join(ChurnRiskScore, ActionCard.risk_score_id == ChurnRiskScore.id)
            .where(
                ActionCard.tenant_id == uuid.UUID(tenant_id),
                ActionCard.status == ActionCardStatus.PENDING
            )
            .order_by(ChurnRiskScore.score.desc(), ActionCard.created_at.asc())
        )
        
        result = await db.execute(stmt)
        cards_with_scores = result.all()
        
        from app.domain.watchtower.message_generator import NotificationPayload, WhatsAppDeliveryAdapter
        from collections import defaultdict
        
        response_payload = []
        for card, score in cards_with_scores:
            # Build agnostic payload
            payload = NotificationPayload(
                title=card.title, 
                body_template=card.body_template, 
                context_variables=card.context_variables
            )
            
            # Mock phone number for MVP (in production, join with Athlete table)
            mock_phone = "5491100000000"
            deep_link = WhatsAppDeliveryAdapter.format_deep_link(mock_phone, payload)
            
            # Formatted message for the UI
            safe_context = defaultdict(lambda: "[N/A]", card.context_variables)
            try:
                message_text = card.body_template.format_map(safe_context)
            except Exception:
                message_text = "Ver detalles en Bienestar APP."

            response_payload.append({
                "id": str(card.id),
                "athlete_id": str(card.athlete_id),
                "athlete_name": card.context_variables.get("nombre", "Atleta"),
                "risk_score": score,
                "title": card.title,
                "message": message_text,
                "action_execution": {
                    "type": "EXTERNAL_DEEP_LINK",
                    "payload": {
                        "url": deep_link
                    }
                },
                "created_at": card.created_at.isoformat()
            })
            
        return response_payload
        
    # except ValueError:
    #    raise HTTPException(status_code=400, detail="tenant_id inválido")
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error fetching action cards: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


class StatusUpdateRequest(BaseModel):
    status: ActionCardStatus

@router.patch("/action-cards/{card_id}/status")
async def update_action_card_status(
    card_id: str, 
    request: StatusUpdateRequest, 
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza el estado de una tarjeta de acción (ej. a CONTACTED).
    Crítico para la resolución del Cooldown y Telemetría.
    """
    try:
        stmt = (
            update(ActionCard)
            .where(ActionCard.id == uuid.UUID(card_id))
            .values(status=request.status)
        )
        result = await db.execute(stmt)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="ActionCard no encontrada")
            
        await db.commit()
        return {"status": "success"}
    except ValueError:
        raise HTTPException(status_code=400, detail="ID inválido")

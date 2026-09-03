"""
Chat Router — Mensajería contextual en tiempo real e histórica entre profesional y atleta.
Persistencia real en PostgreSQL (tablas conversations y messages) con compatibilidad
hacia todos los formatos de payloads del frontend.
"""

import uuid
from typing import Any, List, Optional
from datetime import datetime

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import Conversation, Message, Client, Professional
from app.middleware.auth import get_current_user, TokenData

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = structlog.get_logger()


# =============================================================================
# SCHEMAS
# =============================================================================

class ChatMessagePayload(BaseModel):
    recipient_id: Optional[str] = None
    athlete_id: Optional[str] = None
    coach_id: Optional[str] = None
    content: Optional[str] = None
    text: Optional[str] = None
    media_type: Optional[str] = "text"
    media_url: Optional[str] = None
    topic_type: Optional[str] = "GENERAL"
    is_system_generated: Optional[bool] = False

    model_config = ConfigDict(extra="ignore")


class ChatMessageResponse(BaseModel):
    id: str
    text: str
    sender: str
    time: str
    timestamp: float
    media_type: str
    status: str
    conversation_id: Optional[str] = None


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/conversations", summary="Listar conversaciones del usuario")
async def list_conversations(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Retorna la lista de conversaciones activas del usuario autenticado.
    """
    user_id = current_user.user_id
    
    query = (
        select(Conversation)
        .where(
            or_(
                Conversation.client_id == user_id,
                Conversation.professional_id == user_id,
            )
        )
        .options(
            selectinload(Conversation.client),
            selectinload(Conversation.professional),
            selectinload(Conversation.messages),
        )
        .order_by(Conversation.updated_at.desc())
    )
    
    result = await db.execute(query)
    conversations = list(result.scalars().unique().all())
    
    output = []
    for c in conversations:
        last_msg = sorted(c.messages, key=lambda m: m.created_at)[-1] if c.messages else None
        output.append({
            "id": str(c.id),
            "client_id": str(c.client_id),
            "client_name": f"{c.client.first_name} {c.client.last_name}" if c.client else "Atleta",
            "professional_id": str(c.professional_id),
            "professional_name": f"{c.professional.first_name} {c.professional.last_name}" if c.professional else "Coach",
            "entity_type": c.entity_type,
            "last_message": last_msg.content if last_msg else None,
            "last_message_time": last_msg.created_at.strftime("%H:%M") if last_msg else None,
            "unread_count": sum(1 for m in c.messages if not m.is_read and m.sender_id != user_id),
        })
        
    return output


@router.get("/messages", summary="Obtener mensajes cronológicos de chat")
async def get_chat_messages(
    athlete_id: Optional[str] = Query(None),
    conversation_id: Optional[uuid.UUID] = Query(None),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ChatMessageResponse]:
    """
    Retorna los mensajes de chat para el atleta / conversación dada.
    """
    user_id = current_user.user_id
    
    # 1. Si se envía conversation_id directo
    if conversation_id:
        result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        messages = list(result.scalars().all())
    else:
        # 2. Buscar por athlete_id o current_user
        target_client_id = None
        if athlete_id:
            try:
                target_client_id = uuid.UUID(athlete_id)
            except ValueError:
                pass
        
        if not target_client_id:
            target_client_id = user_id

        conv_result = await db.execute(
            select(Conversation)
            .where(
                or_(
                    Conversation.client_id == target_client_id,
                    Conversation.professional_id == user_id,
                )
            )
            .options(selectinload(Conversation.messages))
            .order_by(Conversation.updated_at.desc())
            .limit(1)
        )
        conv = conv_result.scalar_one_or_none()
        messages = conv.messages if conv else []

    output = []
    for msg in messages:
        sender_label = "me" if msg.sender_id == user_id else "coach"
        output.append(
            ChatMessageResponse(
                id=str(msg.id),
                text=msg.content,
                sender=sender_label,
                time=msg.created_at.strftime("%H:%M") if msg.created_at else "12:00",
                timestamp=msg.created_at.timestamp() if msg.created_at else datetime.utcnow().timestamp(),
                media_type="text",
                status="read" if msg.is_read else "sent",
                conversation_id=str(msg.conversation_id) if msg.conversation_id else None,
            )
        )

    # Si no hay mensajes en DB todavía, proveer fallback inicial para onboarding
    if not output:
        now = datetime.utcnow()
        output = [
            ChatMessageResponse(
                id="msg-welcome-1",
                text="¡Hola! Bienvenido a tu plan personalizado. Escribime ante cualquier duda sobre tu rutina o técnica.",
                sender="coach",
                time=now.strftime("%H:%M"),
                timestamp=now.timestamp() - 60,
                media_type="text",
                status="read",
            )
        ]

    return output


@router.post("/messages", response_model=ChatMessageResponse, summary="Enviar mensaje (alias estándar)")
@router.post("/send", response_model=ChatMessageResponse, summary="Enviar mensaje (alias rápido)")
async def send_chat_message(
    payload: ChatMessagePayload,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Envía y persiste un mensaje en PostgreSQL. Crea la conversación si aún no existe.
    """
    message_text = payload.text or payload.content or ""
    if not message_text.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    sender_id = current_user.user_id
    tenant_id = current_user.tenant_id

    # Determinar destinatario
    target_id_str = payload.recipient_id or payload.athlete_id or payload.coach_id
    target_uuid = None
    if target_id_str:
        try:
            target_uuid = uuid.UUID(target_id_str)
        except ValueError:
            pass

    # Buscar conversación existente o crear una
    conv_query = select(Conversation).where(
        or_(
            and_(Conversation.client_id == sender_id, Conversation.tenant_id == tenant_id),
            and_(Conversation.professional_id == sender_id, Conversation.tenant_id == tenant_id),
        )
    )
    if target_uuid:
        conv_query = select(Conversation).where(
            or_(
                and_(Conversation.client_id == target_uuid, Conversation.professional_id == sender_id),
                and_(Conversation.client_id == sender_id, Conversation.professional_id == target_uuid),
            )
        )

    conv_res = await db.execute(conv_query)
    conv = conv_res.scalars().first()

    if not conv:
        # Crear conversación nueva
        conv = Conversation(
            tenant_id=tenant_id,
            client_id=target_uuid if current_user.role == "professional" and target_uuid else sender_id,
            professional_id=sender_id if current_user.role == "professional" else (target_uuid or sender_id),
            entity_type="GENERAL",
        )
        db.add(conv)
        await db.flush()

    new_msg = Message(
        conversation_id=conv.id,
        sender_id=sender_id,
        sender_type="PROFESSIONAL" if current_user.role == "professional" else "CLIENT",
        content=message_text,
        is_read=False,
    )
    db.add(new_msg)
    conv.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(new_msg)

    logger.info(
        "chat_message_sent",
        message_id=str(new_msg.id),
        conversation_id=str(conv.id),
        sender_id=str(sender_id),
    )

    return ChatMessageResponse(
        id=str(new_msg.id),
        text=new_msg.content,
        sender="me",
        time=new_msg.created_at.strftime("%H:%M"),
        timestamp=new_msg.created_at.timestamp(),
        media_type=payload.media_type or "text",
        status="sent",
        conversation_id=str(conv.id),
    )

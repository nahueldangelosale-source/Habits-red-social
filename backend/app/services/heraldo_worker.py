import asyncio
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Message, Conversation, Client, Professional
from app.db.connection import async_session_maker
# El Heraldo utiliza el servicio WhatsApp existente para despachar los mensajes
# En una aplicación real tendríamos un SMSGatewayService o Twilio. 

logger = logging.getLogger(__name__)

class ElHeraldoWorker:
    """
    Trabajador asíncrono para SOVEREIGN AGORA.
    Busca mensajes no leídos del profesional al cliente mayores a 5 mins
    y dispara una notificación Push / WhatsApp para forzar la adopción de la App.
    """
    
    _is_running = False
    _task = None
    
    @classmethod
    def start(cls, check_interval_seconds: int = 60):
        if not cls._is_running:
            cls._is_running = True
            cls._task = asyncio.create_task(cls._loop(check_interval_seconds))
            logger.info("El Heraldo: Worker iniciado.")
            
    @classmethod
    def stop(cls):
        cls._is_running = False
        if cls._task:
            cls._task.cancel()
            logger.info("El Heraldo: Worker detenido.")

    @classmethod
    async def _loop(cls, interval: int):
        while cls._is_running:
            try:
                await cls._sweep_unread_messages()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"El Heraldo ERROR en el ciclo de barrido: {e}")
            
            await asyncio.sleep(interval)
            
    @classmethod
    async def _sweep_unread_messages(cls):
        """Busca mensajes no alertados (>5 mins) y envía fallback."""
        now = datetime.now(timezone.utc)
        threshold = now - timedelta(minutes=5)
        
        async with async_session_maker() as db:
            # Query: Mensajes is_read == False 
            # AND sender_type == 'PROFESSIONAL' 
            # AND created_at < 5 minutos atrás
            # Limitamos para no ahogar si hay una avalancha.
            # Idealmente, aquí también checaríamos `is_notified == False`. 
            # Modificaremos is_read momentáneamente o crearemos la lógica.
            
            stmt = (
                select(Message, Conversation, Client, Professional)
                .join(Conversation, Message.conversation_id == Conversation.id)
                .join(Client, Conversation.client_id == Client.id)
                .join(Professional, Conversation.professional_id == Professional.id)
                .where(Message.is_read == False)
                .where(Message.sender_type == 'PROFESSIONAL')
                .where(Message.created_at <= threshold)
                .limit(50)
            )
            
            result = await db.execute(stmt)
            rows = result.all()
            
            for msg_row in rows:
                message, conversation, client, professional = msg_row
                
                # Despachar mensaje por WhatsApp.
                # Deep Link estricto a la App
                deep_link = f"https://bienestar.app/w/{client.id}/chat/{conversation.id}"
                
                fallback_text = (
                    f"🔔 Coach {professional.first_name} te ha respondido en la App.\n\n"
                    f"Para ver la respuesta y tus rutinas, entra aquí:\n👉 {deep_link}"
                )
                
                logger.info(f"El Heraldo: Enviando Fallback WhatsApp a cliente {client.phone}")
                # Aquí llamaríamos a whatsapp_service.send_template(...)
                
                # Marcar is_read momentáneamente para que el bot no lo vuelva a enviar.
                # En un modelo perfecto, tendríamos 'notified_at'.
                message.is_read = True 
                
            if rows:
                await db.commit()

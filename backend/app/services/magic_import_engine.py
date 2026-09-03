import uuid
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from pydantic import ValidationError
from app.db.models import Client, ImportQuarantineLog
from app.schemas.magic_import import AthleteImportSchema
from datetime import datetime
import asyncio

class MagicImportEngine:
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID, professional_id: uuid.UUID = None):
        self.session = session
        self.tenant_id = tenant_id
        self.professional_id = professional_id

    async def process_batch(self, raw_records: List[Dict[str, Any]]) -> Tuple[int, int]:
        """
        Procesa un lote de registros crudos (ej. desde un CSV parseado).
        Aplica el patrón Sovereign Quarantine:
        1. Valida cada registro con Pydantic.
        2. Si falla, va a la lista de cuarentena.
        3. Si pasa, va a la lista de válidos.
        4. Inserta válidos en bulk.
        5. Inserta cuarentenas en bulk.
        Retorna (success_count, quarantine_count)
        """
        valid_clients = []
        quarantine_logs = []

        for record in raw_records:
            try:
                # 1. Validación Estricta
                valid_data = AthleteImportSchema(**record)
                
                # Preparar para insert core
                client_dict = {
                    "id": uuid.uuid4(),
                    "tenant_id": self.tenant_id,
                    "professional_id": self.professional_id,
                    "first_name": valid_data.first_name,
                    "last_name": valid_data.last_name,
                    "email": valid_data.email,
                    "phone": valid_data.phone,
                    "whatsapp_id": valid_data.whatsapp_id,
                    "birth_date": valid_data.birth_date,
                    "height_cm": valid_data.height_cm,
                    "extra_data": valid_data.extra_data,
                    "sync_status": "synced",
                    "is_active": True,
                    "coaching_status": "active",
                    "payment_status": "trial",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                if valid_data.weight_kg:
                    client_dict["extra_data"]["weight_kg"] = valid_data.weight_kg
                    
                valid_clients.append(client_dict)
                
            except ValidationError as e:
                # 2. Captura en Cuarentena
                error_msg = "; ".join([f"{err['loc']}: {err['msg']}" for err in e.errors()])
                quarantine_logs.append({
                    "id": uuid.uuid4(),
                    "tenant_id": self.tenant_id,
                    "raw_payload": record,
                    "error_reason": f"ValidationError: {error_msg}",
                    "status": "pending",
                    "created_at": datetime.utcnow()
                })
            except Exception as e:
                quarantine_logs.append({
                    "id": uuid.uuid4(),
                    "tenant_id": self.tenant_id,
                    "raw_payload": record,
                    "error_reason": f"Unexpected Error: {str(e)}",
                    "status": "pending",
                    "created_at": datetime.utcnow()
                })

        # Insertar clientes válidos usando un core insert masivo
        success_count = 0
        if valid_clients:
            try:
                stmt = insert(Client).values(valid_clients).on_conflict_do_nothing(
                    index_elements=['tenant_id', 'email'] # Asumiendo constraint unique si aplica
                )
                await self.session.execute(stmt)
                success_count = len(valid_clients)
            except Exception as e:
                # Fallback: Si el bulk insert de db falla por IntegrityError, mandar todo el chunk a quarantine
                # Para ser 100% resilientes, deberíamos iterar uno por uno, pero por SLA de 10s:
                for c in valid_clients:
                    quarantine_logs.append({
                        "id": uuid.uuid4(),
                        "tenant_id": self.tenant_id,
                        "raw_payload": c,
                        "error_reason": f"BulkInsertError: {str(e)}",
                        "status": "pending",
                        "created_at": datetime.utcnow()
                    })
                success_count = 0

        # Insertar logs de cuarentena
        quarantine_count = len(quarantine_logs)
        if quarantine_logs:
            q_stmt = insert(ImportQuarantineLog).values(quarantine_logs)
            await self.session.execute(q_stmt)

        # Commit del chunk
        await self.session.commit()
        
        return success_count, quarantine_count

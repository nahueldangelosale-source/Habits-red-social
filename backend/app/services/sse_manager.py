import asyncio
import json
from typing import Any, Dict
from uuid import UUID

import structlog

logger = structlog.get_logger()

class ConnectionManager:
    """
    In-memory SSE Connection Manager.
    Manage active server-sent event streams per B2B tenant.
    """
    def __init__(self):
        # Maps tenant_id to a list of asyncio.Queue instances
        self.active_connections: Dict[UUID, list[asyncio.Queue]] = {}

    def connect(self, tenant_id: UUID) -> asyncio.Queue:
        """Create a new SSE queue for a tenant."""
        queue = asyncio.Queue()
        if tenant_id not in self.active_connections:
            self.active_connections[tenant_id] = []
        self.active_connections[tenant_id].append(queue)
        logger.info("sse_client_connected", tenant_id=str(tenant_id), active_clients=len(self.active_connections[tenant_id]))
        return queue

    def disconnect(self, tenant_id: UUID, queue: asyncio.Queue):
        """Remove a queue from the tenant's active connections."""
        if tenant_id in self.active_connections:
            if queue in self.active_connections[tenant_id]:
                self.active_connections[tenant_id].remove(queue)
            if not self.active_connections[tenant_id]:
                del self.active_connections[tenant_id]
        logger.info("sse_client_disconnected", tenant_id=str(tenant_id))

    async def broadcast_to_tenant(self, tenant_id: UUID, message_type: str, payload: dict[str, Any]):
        """
        Push an event to all active SSE queues for a specific tenant.
        """
        if tenant_id in self.active_connections:
            # Construct JSON payload
            data = json.dumps({
                "type": message_type,
                "payload": payload
            })
            
            # Write to all listening queues
            disconnected_queues = []
            for queue in self.active_connections[tenant_id]:
                try:
                    await queue.put(data)
                except Exception as e:
                    logger.warning("sse_broadcast_failed", error=str(e), tenant_id=str(tenant_id))
                    disconnected_queues.append(queue)
            
            # Cleanup any dropped queues immediately
            for q in disconnected_queues:
                self.disconnect(tenant_id, q)
                
            logger.info("sse_event_broadcasted", tenant_id=str(tenant_id), message_type=message_type)

sse_manager = ConnectionManager()

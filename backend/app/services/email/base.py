from abc import ABC, abstractmethod

class EmailProvider(ABC):
    @abstractmethod
    async def send_invitation(self, email: str, token: str, tenant_name: str) -> None:
        pass

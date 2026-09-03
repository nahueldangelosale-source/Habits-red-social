from .base import EmailProvider

class ConsoleEmailProvider(EmailProvider):
    async def send_invitation(self, email: str, token: str, tenant_name: str) -> None:
        invitation_url = f"http://localhost:5173/accept-invitation?token={token}"
        print(f"\n[COURIER MOCK LOG] Enviando email a {email}")
        print(f"Tenant: {tenant_name}")
        print(f"URL de Acceso: {invitation_url}\n")

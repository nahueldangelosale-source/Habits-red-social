from .base import EmailProvider
from .console import ConsoleEmailProvider

def get_email_provider() -> EmailProvider:
    return ConsoleEmailProvider()

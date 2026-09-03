from pydantic import BaseModel, UUID4, Field
from datetime import datetime
from typing import Optional

class InvoiceBase(BaseModel):
    reservation_id: Optional[UUID4] = None
    amount_cents: int
    currency: str = "ARS"

class InvoiceCreate(InvoiceBase):
    tenant_id: UUID4
    user_id: UUID4

class InvoiceResponse(InvoiceBase):
    id: UUID4
    tenant_id: UUID4
    user_id: UUID4
    status: str
    provider_payment_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LedgerEntryResponse(BaseModel):
    id: UUID4
    tenant_id: UUID4
    user_id: UUID4
    amount_cents: int
    currency: str
    reference_type: str
    reference_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentIntentResponse(BaseModel):
    invoice_id: UUID4
    payment_url: str # URL of MercadoPago Checkout

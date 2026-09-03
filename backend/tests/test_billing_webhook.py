import pytest
from app.api.billing_routes import SimulateWebhookRequest


def test_simulate_webhook_schema():
    # 1. Default instance
    req = SimulateWebhookRequest()
    assert req.payment_id.startswith("pay_")
    assert req.amount_cents == 500000
    assert req.status == "approved"

    # 2. Custom values
    custom_req = SimulateWebhookRequest(
        payment_id="mp_pay_123456",
        amount_cents=1500000,
        status="approved",
    )
    assert custom_req.payment_id == "mp_pay_123456"
    assert custom_req.amount_cents == 1500000


if __name__ == "__main__":
    test_simulate_webhook_schema()
    print("[OK] All billing webhook unit tests passed successfully!")

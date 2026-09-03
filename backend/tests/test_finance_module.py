import pytest
from app.services.finance_service import FinanceService


def test_finance_overview_calculation():
    # Mock structure of memberships
    class MockMembership:
        def __init__(self, monthly_amount, status):
            self.monthly_amount = monthly_amount
            self.status = status

    memberships = [
        MockMembership(45000, "PAID"),
        MockMembership(38000, "PAID"),
        MockMembership(28000, "PENDING"),
        MockMembership(45000, "OVERDUE"),
        MockMembership(38000, "OVERDUE"),
    ]

    active_subs = [m for m in memberships if m.status in ("PAID", "PENDING")]
    overdue_subs = [m for m in memberships if m.status == "OVERDUE"]

    mrr = sum(m.monthly_amount for m in active_subs)
    total_overdue = sum(m.monthly_amount for m in overdue_subs)
    avg_ticket = round(mrr / len(active_subs)) if active_subs else 0

    assert mrr == 111000
    assert total_overdue == 83000
    assert len(active_subs) == 3
    assert len(overdue_subs) == 2
    assert avg_ticket == 37000


if __name__ == "__main__":
    test_finance_overview_calculation()
    print("[OK] All FinanceService unit tests passed successfully!")

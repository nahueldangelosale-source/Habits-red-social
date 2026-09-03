import hashlib
import pytest
from hypothesis import given, settings, strategies as st
from httpx import AsyncClient, ASGITransport
from app.main import app

# OpenTelemetry Test Setup
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

# Setup OTel in-memory monitoring for tests

exporter = InMemorySpanExporter()
processor = SimpleSpanProcessor(exporter)
provider = TracerProvider()
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

@pytest.mark.asyncio
@given(
    username=st.one_of(
        st.emails(),
        st.text(min_size=1, max_size=500), # Long strings
        st.binary(min_size=1, max_size=100).map(lambda b: b.decode('utf-8', 'ignore')), # Malformed/Binary
        st.just("\x00"), # Null byte
        st.just("' OR '1'='1"), # SQLi attempt
    ),
    password=st.text(min_size=1, max_size=200)
)
@settings(max_examples=20, deadline=None)
async def test_auth_login_pbt_invariants(username, password):

    """
    Quality Gate: Property-Based Testing for Auth.
    Invariants:
    1. System must NEVER return 500 (Internal Server Error).
    2. Invalid attempts must emit a 'FAILURE' security span.
    """
    # Clear exporter before each test case
    exporter.clear()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Use form data as required by OAuth2PasswordRequestForm
        response = await ac.post(
            "/api/v1/auth/token",
            data={"username": username, "password": password}
        )
    
    # Invariant 1: No 500s
    assert response.status_code != 500, f"System crashed with 500 for input: {username!r}"
    
    # Invariant 2: OTel Security Event Validation
    spans = exporter.get_finished_spans()
    auth_spans = [s for s in spans if s.name == "authentication_attempt"]
    
    # We must have at least one auth span
    assert len(auth_spans) >= 1
    
    auth_span = auth_spans[0]
    assert auth_span.attributes["security.event.type"] == "authentication_attempt"
    assert "security.event.identity_hash" in auth_span.attributes
    
    # If the response is unauthorized, the span MUST record a failure
    if response.status_code == 401:
        assert auth_span.attributes["security.event.outcome"] == "FAILURE"
        assert "security.event.reason" in auth_span.attributes

@pytest.mark.asyncio
@given(token=st.text(min_size=1, max_size=1000, alphabet=st.characters(codec='ascii', categories=['L', 'N', 'P'])))
@settings(max_examples=20, deadline=None)
async def test_auth_whoami_pbt_invariants(token):


    """
    Quality Gate: Validates whoami endpoint with malformed tokens.
    Invariant: No unhandled exceptions (500).
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(
            "/api/v1/auth/whoami",
            headers={"Authorization": f"Bearer {token}"}
        )
    
    # Must be 401 or 403 or 422, but NEVER 500
    assert response.status_code != 500

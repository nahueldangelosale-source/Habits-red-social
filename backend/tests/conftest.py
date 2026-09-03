import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator
import uuid

from app.main import app
from app.config import get_settings
from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData

settings = get_settings()

TEST_DATABASE_URL = settings.database_url 

# IDs determinísticos para tests
TEST_USER_ID = uuid.UUID("4d76be7f-8b2b-4cb4-ad24-97296da99654")
TEST_TENANT_ID = uuid.UUID("4d76be7f-8b2b-4cb4-ad24-97296da99654")

@pytest_asyncio.fixture
async def db_engine():
    """Engine con NullPool creado por cada test para evitar colisiones de EventLoop."""
    test_engine = create_async_engine(
        TEST_DATABASE_URL, 
        echo=False, 
        poolclass=NullPool,
        connect_args={"prepared_statement_cache_size": 0, "statement_cache_size": 0}
    )
    yield test_engine
    await test_engine.dispose()

@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Sesión fresca para cada test."""
    session_maker = async_sessionmaker(bind=db_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_maker() as session:
        yield session

@pytest_asyncio.fixture
async def client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    """
    Cliente de pruebas de FastAPI con inyección de dependencia sobreescrita.
    Cada request obtiene una sesión limpia del session_maker con NullPool.
    """
    session_maker = async_sessionmaker(bind=db_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_maker() as session:
            yield session
        
    app.dependency_overrides[get_db] = override_get_db
    
    async def override_get_current_user():
        return TokenData(
            user_id=TEST_USER_ID,
            tenant_id=TEST_TENANT_ID,
            role="professional"
        )
        
    app.dependency_overrides[get_current_user] = override_get_current_user

    async with AsyncClient(
        transport=ASGITransport(app=app), 
        base_url="http://testserver",
        follow_redirects=True
    ) as ac:
        yield ac
        
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def admin_client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    """Cliente con rol admin."""
    session_maker = async_sessionmaker(bind=db_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_maker() as session:
            yield session
        
    app.dependency_overrides[get_db] = override_get_db
    
    async def override_get_current_user():
        return TokenData(
            user_id=TEST_USER_ID,
            tenant_id=TEST_TENANT_ID,
            role="admin"
        )
        
    app.dependency_overrides[get_current_user] = override_get_current_user

    async with AsyncClient(
        transport=ASGITransport(app=app), 
        base_url="http://testserver",
        follow_redirects=True
    ) as ac:
        yield ac
        
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def athlete_client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    """Cliente con rol athlete para flujos B2C."""
    session_maker = async_sessionmaker(bind=db_engine, class_=AsyncSession, expire_on_commit=False)
    athlete_id = uuid.uuid4()

    async def override_get_db():
        async with session_maker() as session:
            yield session
        
    app.dependency_overrides[get_db] = override_get_db
    
    async def override_get_current_user():
        return TokenData(
            user_id=athlete_id,
            tenant_id=TEST_TENANT_ID,
            role="athlete"
        )
        
    app.dependency_overrides[get_current_user] = override_get_current_user

    async with AsyncClient(
        transport=ASGITransport(app=app), 
        base_url="http://testserver",
        follow_redirects=True
    ) as ac:
        yield ac
        
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def e2e_client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    """
    Cliente de pruebas E2E puro (sin mockear get_current_user).
    Permite validar flujos de autenticación reales con JWT Tokens.
    """
    session_maker = async_sessionmaker(bind=db_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_maker() as session:
            yield session
        
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), 
        base_url="http://testserver",
        follow_redirects=True
    ) as ac:
        yield ac
        
    app.dependency_overrides.clear()


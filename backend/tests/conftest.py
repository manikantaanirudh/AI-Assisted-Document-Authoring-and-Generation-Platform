import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app
from app.core.config import settings
import os

# Use test database
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql://user:password@localhost:5432/test_db")

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "password": "testpassword123"
    }

@pytest.fixture
def auth_token(client, test_user_data):
    """Create a test user and return auth token."""
    # Register user
    response = client.post("/api/v1/auth/register", json=test_user_data)
    if response.status_code == 201:
        return response.json()["access_token"]
    # If user exists, login instead
    response = client.post("/api/v1/auth/login", json=test_user_data)
    return response.json()["access_token"]


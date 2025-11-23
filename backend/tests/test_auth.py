import pytest
from fastapi import status

def test_register(client, test_user_data):
    """Test user registration."""
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_register_duplicate_email(client, test_user_data):
    """Test registration with duplicate email."""
    client.post("/api/v1/auth/register", json=test_user_data)
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_login(client, test_user_data):
    """Test user login."""
    # Register first
    client.post("/api/v1/auth/register", json=test_user_data)
    # Then login
    response = client.post("/api/v1/auth/login", json=test_user_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data

def test_login_invalid_credentials(client, test_user_data):
    """Test login with invalid credentials."""
    response = client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": "wrongpassword"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user(client, auth_token):
    """Test getting current user info."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "email" in data
    assert "id" in data


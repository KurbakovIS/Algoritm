import pytest
from fastapi.testclient import TestClient
from app.models import User
from app.auth import hash_password, verify_password
import json

def test_password_hashing():
    """Test bcrypt password hashing and verification."""
    password = "testpassword123"
    hashed = hash_password(password)
    
    # Hash should be different from original password
    assert hashed != password
    assert len(hashed) > 50  # bcrypt hashes are long
    
    # Verification should work
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_user_registration(client, db_session):
    """Test user registration endpoint."""
    response = client.post("/auth/register", json={
        "email": "newuser@example.com",
        "password": "password123",
        "role": "junior"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "junior"
    assert data["xp"] == 0
    assert data["badges"] == []
    
    # Check user was created in database
    user = db_session.query(User).filter(User.email == "newuser@example.com").first()
    assert user is not None
    assert verify_password("password123", user.password_hash)

def test_user_registration_duplicate_email(client, test_user):
    """Test registration with duplicate email fails."""
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "role": "junior"
    })
    
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_user_registration_weak_password(client):
    """Test registration with weak password fails."""
    response = client.post("/auth/register", json={
        "email": "newuser@example.com",
        "password": "123",
        "role": "junior"
    })
    
    assert response.status_code == 422  # Validation error

def test_user_login_success(client, test_user):
    """Test successful user login."""
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_user_login_invalid_credentials(client, test_user):
    """Test login with invalid credentials fails."""
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_user_login_nonexistent_user(client):
    """Test login with nonexistent user fails."""
    response = client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "password123"
    })
    
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_get_current_user(client, auth_headers, test_user):
    """Test getting current user profile."""
    response = client.get("/auth/me", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "junior"
    assert data["xp"] == 100
    assert "Apprentice" in data["badges"]

def test_get_current_user_unauthorized(client):
    """Test getting current user without token fails."""
    response = client.get("/auth/me")
    
    assert response.status_code == 401

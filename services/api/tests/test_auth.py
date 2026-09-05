import pytest

def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_login_missing_fields(client):
    response = client.post("/api/auth/login", json={})
    assert response.status_code == 422

def test_unauthorized_access(client):
    response = client.get("/api/checkpoints")
    assert response.status_code == 401

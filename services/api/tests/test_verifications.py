import pytest

def test_create_verification_unauthorized(client):
    response = client.post("/api/verifications", json={"checkpoint_id": "test"})
    assert response.status_code == 401

def test_get_verification_not_found(client):
    response = client.get("/api/verifications/nonexistent")
    assert response.status_code == 401

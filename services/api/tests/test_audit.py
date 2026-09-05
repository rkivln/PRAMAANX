import pytest

def test_audit_integrity_unauthorized(client):
    response = client.get("/api/audit/integrity")
    assert response.status_code == 401

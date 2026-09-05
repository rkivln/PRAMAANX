import os
import sys
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))

from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_officer():
    return {
        "id": "00000000-0000-0000-0000-000000000001",
        "officer_id": "TEST/VER/2024-0001",
        "full_name": "TEST OFFICER",
        "role": "officer",
        "active": True,
    }

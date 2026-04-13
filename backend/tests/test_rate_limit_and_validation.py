import pytest
from fastapi.testclient import TestClient

from app import security
from app.database import get_db
from app.main import app


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _auth_headers(user):
    token = security.create_access_token({"sub": str(user.id), "role": user.role})
    return {"Authorization": f"Bearer {token}"}


def test_strict_vital_validation_rejects_out_of_range_payloads(client, user_factory):
    admin = user_factory(email="validation.admin@example.com", role="admin")
    patient = user_factory(email="validation.patient@example.com", role="patient")

    invalid_payload = {
        "patient_id": patient.id,
        "date": "2026-04-14",
        "time": "09:15",
        "systolic": 50,
        "diastolic": 40,
        "heart_rate": 76,
        "temperature": 36.6,
        "spo2": 98,
        "respiratory_rate": 16,
        "weight": 64.5,
        "height": 165.0,
        "recorded_by": "Admin Staff",
    }

    create_response = client.post(
        "/api/vitals/",
        headers=_auth_headers(admin),
        json=invalid_payload,
    )
    assert create_response.status_code == 422


def test_strict_vital_validation_rejects_diastolic_above_systolic(client, user_factory):
    admin = user_factory(email="validation.bp.admin@example.com", role="admin")
    patient = user_factory(email="validation.bp.patient@example.com", role="patient")

    invalid_payload = {
        "patient_id": patient.id,
        "date": "2026-04-14",
        "time": "09:15",
        "systolic": 110,
        "diastolic": 120,
        "heart_rate": 76,
        "temperature": 36.6,
        "spo2": 98,
        "respiratory_rate": 16,
        "weight": 64.5,
        "height": 165.0,
        "recorded_by": "Admin Staff",
    }

    create_response = client.post(
        "/api/vitals/",
        headers=_auth_headers(admin),
        json=invalid_payload,
    )
    assert create_response.status_code == 422


def test_login_rate_limit_blocks_excessive_attempts(client, user_factory):
    email = "ratelimit.patient@example.com"
    user_factory(email=email, role="patient", password="Password1!")

    for _ in range(10):
        response = client.post(
            "/api/login/",
            json={"email": email, "password": "WrongPassword1!"},
        )
        assert response.status_code == 401

    blocked_response = client.post(
        "/api/login/",
        json={"email": email, "password": "WrongPassword1!"},
    )

    assert blocked_response.status_code == 429
    assert "Retry-After" in blocked_response.headers

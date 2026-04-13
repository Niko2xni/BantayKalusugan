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


def _submission_payload(**overrides):
    payload = {
        "date": "2026-04-14",
        "time": "09:15",
        "systolic": 128,
        "diastolic": 82,
        "heart_rate": 76,
        "temperature": 36.6,
        "spo2": 98,
        "respiratory_rate": 16,
        "weight": 64.5,
        "height": 165.0,
    }
    payload.update(overrides)
    return payload


def test_vital_submission_approval_creates_vital_record(client, user_factory):
    admin = user_factory(email="approval.admin@example.com", role="admin")
    patient = user_factory(email="approval.patient@example.com", role="patient")

    submit_response = client.post(
        "/api/me/vitals/submissions",
        headers=_auth_headers(patient),
        json=_submission_payload(),
    )

    assert submit_response.status_code == 200
    submission = submit_response.json()
    assert submission["status"] == "pending"
    assert submission["patient_id"] == patient.id

    admin_queue = client.get(
        "/api/admin/vitals/submissions?status=pending",
        headers=_auth_headers(admin),
    )
    assert admin_queue.status_code == 200
    assert len(admin_queue.json()) == 1
    assert admin_queue.json()[0]["patient_name"] == f"{patient.first_name} {patient.last_name}"

    review_response = client.patch(
        f"/api/admin/vitals/submissions/{submission['id']}/review",
        headers=_auth_headers(admin),
        json={"status": "approved", "admin_notes": "Validated against intake form."},
    )

    assert review_response.status_code == 200
    review_payload = review_response.json()
    assert review_payload["submission"]["status"] == "approved"
    assert review_payload["created_vital"] is not None
    assert review_payload["created_vital"]["patient_id"] == patient.id

    patient_vitals = client.get("/api/me/vitals", headers=_auth_headers(patient))
    assert patient_vitals.status_code == 200
    assert any(item["id"] == review_payload["created_vital"]["id"] for item in patient_vitals.json())

    rereview_response = client.patch(
        f"/api/admin/vitals/submissions/{submission['id']}/review",
        headers=_auth_headers(admin),
        json={"status": "rejected", "admin_notes": "Already reviewed."},
    )
    assert rereview_response.status_code == 400


def test_vital_submission_rejection_keeps_patient_vitals_unchanged(client, user_factory):
    admin = user_factory(email="rejection.admin@example.com", role="admin")
    patient = user_factory(email="rejection.patient@example.com", role="patient")

    submit_response = client.post(
        "/api/me/vitals/submissions",
        headers=_auth_headers(patient),
        json=_submission_payload(heart_rate=84),
    )
    assert submit_response.status_code == 200
    submission_id = submit_response.json()["id"]

    reject_response = client.patch(
        f"/api/admin/vitals/submissions/{submission_id}/review",
        headers=_auth_headers(admin),
        json={"status": "rejected", "admin_notes": "Please retake resting values."},
    )

    assert reject_response.status_code == 200
    payload = reject_response.json()
    assert payload["submission"]["status"] == "rejected"
    assert payload["created_vital"] is None

    patient_vitals = client.get("/api/me/vitals", headers=_auth_headers(patient))
    assert patient_vitals.status_code == 200
    assert patient_vitals.json() == []


def test_strict_vital_validation_rejects_out_of_range_payloads(client, user_factory):
    admin = user_factory(email="validation.admin@example.com", role="admin")
    patient = user_factory(email="validation.patient@example.com", role="patient")

    invalid_admin_payload = {
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

    admin_create_response = client.post(
        "/api/vitals/",
        headers=_auth_headers(admin),
        json=invalid_admin_payload,
    )
    assert admin_create_response.status_code == 422

    invalid_submission = _submission_payload(systolic=110, diastolic=120)
    patient_submit_response = client.post(
        "/api/me/vitals/submissions",
        headers=_auth_headers(patient),
        json=invalid_submission,
    )
    assert patient_submit_response.status_code == 422


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

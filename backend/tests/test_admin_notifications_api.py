import pytest
from fastapi.testclient import TestClient

from app import crud, security
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


def test_admin_notifications_flow(client, db_session, user_factory):
    admin = user_factory(email="admin.notifications@example.com", role="admin")

    first_notification = crud._create_notification(
        db_session,
        user_id=admin.id,
        title="Report export ready",
        body="The monthly PDF export completed successfully.",
        kind="report",
    )
    second_notification = crud._create_notification(
        db_session,
        user_id=admin.id,
        title="System settings saved",
        body="Notification preferences were updated.",
        kind="settings",
    )
    db_session.commit()

    list_response = client.get("/api/admin/notifications", headers=_auth_headers(admin))
    assert list_response.status_code == 200

    notifications = list_response.json()
    assert [item["id"] for item in notifications] == [second_notification.id, first_notification.id]

    unread_response = client.get(
        "/api/admin/notifications?only_unread=true",
        headers=_auth_headers(admin),
    )
    assert unread_response.status_code == 200
    assert len(unread_response.json()) == 2

    read_response = client.patch(
        f"/api/admin/notifications/{first_notification.id}/read",
        headers=_auth_headers(admin),
    )
    assert read_response.status_code == 200
    assert read_response.json()["is_read"] is True

    read_all_response = client.patch(
        "/api/admin/notifications/read-all",
        headers=_auth_headers(admin),
    )
    assert read_all_response.status_code == 200
    assert "Marked 1 notifications as read" in read_all_response.json()["message"]

    db_session.refresh(first_notification)
    db_session.refresh(second_notification)
    assert first_notification.is_read is True
    assert second_notification.is_read is True


def test_admin_appointment_queue_status_update_and_notifications(client, user_factory):
    admin = user_factory(email="admin.appointments@example.com", role="admin")
    patient = user_factory(email="patient.appointments@example.com", role="patient")

    request_response = client.post(
        "/api/me/appointments/request",
        headers=_auth_headers(patient),
        json={
            "appointment_type": "General Consultation",
            "health_area": "General",
            "scheduled_at": "2026-08-03T09:00:00Z",
            "location": "Barangay Health Center",
            "notes": "Needs an early slot",
        },
    )
    assert request_response.status_code == 200
    appointment_id = request_response.json()["id"]

    admin_notifs = client.get(
        "/api/admin/notifications?only_unread=true",
        headers=_auth_headers(admin),
    )
    assert admin_notifs.status_code == 200
    notif_payload = admin_notifs.json()
    assert any(
        item["kind"] == "appointment" and item["title"] == "New appointment request"
        for item in notif_payload
    )

    queue_response = client.get(
        "/api/admin/appointments?status=pending",
        headers=_auth_headers(admin),
    )
    assert queue_response.status_code == 200
    queue_payload = queue_response.json()
    queued_item = next((item for item in queue_payload if item["id"] == appointment_id), None)
    assert queued_item is not None

    update_response = client.patch(
        f"/api/admin/appointments/{appointment_id}/status",
        headers=_auth_headers(admin),
        json={
            "status": "confirmed",
            "assigned_staff": "Nurse Ana",
            "notes": "Bring your previous check-up card",
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "Confirmed"
    assert update_response.json()["assigned_staff"] == "Nurse Ana"

    patient_notifs = client.get(
        "/api/me/notifications?only_unread=true",
        headers=_auth_headers(patient),
    )
    assert patient_notifs.status_code == 200
    patient_payload = patient_notifs.json()
    assert any(
        item["kind"] == "appointment" and item["title"] == "Appointment confirmed"
        for item in patient_payload
    )


def test_patient_cannot_access_admin_queue_endpoints(client, user_factory):
    patient = user_factory(email="patient.no.admin.routes@example.com", role="patient")

    queue_response = client.get("/api/admin/appointments", headers=_auth_headers(patient))
    assert queue_response.status_code == 403

    queue_update_response = client.patch(
        "/api/admin/appointments/1/status",
        headers=_auth_headers(patient),
        json={"status": "confirmed"},
    )
    assert queue_update_response.status_code == 403
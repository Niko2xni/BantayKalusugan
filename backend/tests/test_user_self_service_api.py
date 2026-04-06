import pytest
from datetime import UTC, datetime
from fastapi.testclient import TestClient

from app import crud, schemas, security
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


def test_me_endpoints_require_auth(client):
    response = client.get("/api/me")
    assert response.status_code == 401

    response = client.put("/api/me", json={"address": "Zone 9"})
    assert response.status_code == 401

    response = client.post(
        "/api/me/change-password",
        json={
            "current_password": "CurrentPass1!",
            "new_password": "NewStrong1!",
            "confirm_password": "NewStrong1!",
        },
    )
    assert response.status_code == 401


def test_patient_can_read_and_update_own_profile(client, db_session, user_factory):
    patient = user_factory(
        email="self.patient@example.com",
        phone="09170001111",
        role="patient",
    )

    get_response = client.get("/api/me", headers=_auth_headers(patient))
    assert get_response.status_code == 200
    assert get_response.json()["id"] == patient.id

    update_response = client.put(
        "/api/me",
        headers=_auth_headers(patient),
        json={
            "email": "SELF.PATIENT.UPDATED@example.com",
            "phone": "09170002222",
            "address": "Updated Zone",
        },
    )

    assert update_response.status_code == 200
    payload = update_response.json()
    assert payload["email"] == "self.patient.updated@example.com"
    assert payload["phone"] == "09170002222"
    assert payload["address"] == "Updated Zone"

    db_session.refresh(patient)
    assert patient.email == "self.patient.updated@example.com"


def test_patient_cannot_change_email_to_admin_domain(client, user_factory):
    patient = user_factory(email="domain.patient@example.com", role="patient")

    response = client.put(
        "/api/me",
        headers=_auth_headers(patient),
        json={"email": "patient@bantaykalusugan.com"},
    )

    assert response.status_code == 400
    assert "reserved for admin accounts" in response.json()["detail"]


def test_patient_can_change_password(client, db_session, user_factory):
    current_password = "CurrentPass1!"
    patient = user_factory(
        email="password.patient@example.com",
        role="patient",
        password=current_password,
    )

    response = client.post(
        "/api/me/change-password",
        headers=_auth_headers(patient),
        json={
            "current_password": current_password,
            "new_password": "NewStrong1!",
            "confirm_password": "NewStrong1!",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Password updated successfully"

    db_session.refresh(patient)
    assert security.verify_password("NewStrong1!", patient.hashed_password)


def test_users_read_endpoints_are_admin_only(client, user_factory):
    admin = user_factory(email="admin.lockdown@example.com", role="admin")
    patient = user_factory(email="patient.lockdown@example.com", role="patient")

    patient_response = client.get("/api/users/", headers=_auth_headers(patient))
    assert patient_response.status_code == 403

    admin_response = client.get("/api/users/", headers=_auth_headers(admin))
    assert admin_response.status_code == 200
    assert isinstance(admin_response.json(), list)


def test_patient_vitals_history_latest_and_overview(client, db_session, user_factory):
    admin = user_factory(email="admin.vitals.api@example.com", role="admin")
    patient = user_factory(email="patient.vitals.api@example.com", role="patient")
    other_patient = user_factory(email="other.patient@example.com", role="patient")

    crud.create_vital_sign(
        db_session,
        schemas.VitalSignCreate(
            patient_id=patient.id,
            date="2026-03-01",
            time="08:00",
            systolic=128,
            diastolic=82,
            heart_rate=75,
            temperature=36.5,
            spo2=98,
            respiratory_rate=16,
            weight=64.0,
            height=165.0,
            recorded_by="Admin Staff",
        ),
        admin.id,
    )
    crud.create_vital_sign(
        db_session,
        schemas.VitalSignCreate(
            patient_id=patient.id,
            date="2026-04-05",
            time="09:30",
            systolic=142,
            diastolic=92,
            heart_rate=89,
            temperature=37.1,
            spo2=95,
            respiratory_rate=20,
            weight=64.5,
            height=165.0,
            recorded_by="Admin Staff",
        ),
        admin.id,
    )
    crud.create_vital_sign(
        db_session,
        schemas.VitalSignCreate(
            patient_id=other_patient.id,
            date="2026-04-06",
            time="11:30",
            systolic=120,
            diastolic=80,
            heart_rate=72,
            temperature=36.4,
            spo2=99,
            respiratory_rate=15,
            weight=63.0,
            height=162.0,
            recorded_by="Admin Staff",
        ),
        admin.id,
    )

    history_response = client.get(
        "/api/me/vitals?date_start=2026-04-01&date_end=2026-04-30",
        headers=_auth_headers(patient),
    )
    assert history_response.status_code == 200
    history_payload = history_response.json()
    assert len(history_payload) == 1
    assert history_payload[0]["patient_id"] == patient.id
    assert history_payload[0]["patient_name"] == f"{patient.first_name} {patient.last_name}"

    latest_response = client.get("/api/me/vitals/latest", headers=_auth_headers(patient))
    assert latest_response.status_code == 200
    latest_payload = latest_response.json()
    assert latest_payload["date"] == "2026-04-05"
    assert latest_payload["systolic"] == 142

    overview_response = client.get(
        "/api/me/analytics/overview?date_start=2026-04-01&date_end=2026-04-30",
        headers=_auth_headers(patient),
    )
    assert overview_response.status_code == 200
    overview_payload = overview_response.json()
    assert overview_payload["total_records"] == 1
    assert overview_payload["avg_systolic"] == 142.0
    assert overview_payload["abnormal_bp_records"] == 1


def test_patient_vitals_export_csv(client, db_session, user_factory):
    admin = user_factory(email="admin.vitals.export@example.com", role="admin")
    patient = user_factory(email="patient.vitals.export@example.com", role="patient")

    crud.create_vital_sign(
        db_session,
        schemas.VitalSignCreate(
            patient_id=patient.id,
            date="2026-04-03",
            time="07:45",
            systolic=126,
            diastolic=81,
            heart_rate=74,
            temperature=36.6,
            spo2=98,
            respiratory_rate=16,
            weight=63.8,
            height=164.0,
            recorded_by="Admin Staff",
        ),
        admin.id,
    )

    response = client.get(
        "/api/me/vitals/export?date_start=2026-04-01&date_end=2026-04-30",
        headers=_auth_headers(patient),
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "attachment; filename=\"my-vitals-" in response.headers["content-disposition"]
    assert "Patient Name" in response.text
    assert "2026-04-03" in response.text


def test_admin_cannot_access_patient_only_vitals_endpoints(client, user_factory):
    admin = user_factory(email="admin.only.patient.endpoint@example.com", role="admin")

    response = client.get("/api/me/vitals", headers=_auth_headers(admin))
    assert response.status_code == 403
    assert "Patient access required" in response.json()["detail"]

    response = client.get("/api/me/appointments", headers=_auth_headers(admin))
    assert response.status_code == 403

    response = client.get("/api/me/notifications", headers=_auth_headers(admin))
    assert response.status_code == 403

    response = client.get("/api/me/chat/messages", headers=_auth_headers(admin))
    assert response.status_code == 403

    response = client.get("/api/help/articles", headers=_auth_headers(admin))
    assert response.status_code == 403


def test_patient_appointments_request_reschedule_cancel(client, user_factory):
    patient = user_factory(email="phase4.patient@example.com", role="patient")

    request_response = client.post(
        "/api/me/appointments/request",
        headers=_auth_headers(patient),
        json={
            "appointment_type": "General Consultation",
            "health_area": "General",
            "scheduled_at": "2026-05-03T09:00:00Z",
            "location": "Barangay Health Center",
            "notes": "Needs morning schedule",
        },
    )
    assert request_response.status_code == 200
    appointment = request_response.json()
    assert appointment["status"] == "Pending"

    appointment_id = appointment["id"]

    list_response = client.get("/api/me/appointments", headers=_auth_headers(patient))
    assert list_response.status_code == 200
    listed = list_response.json()
    assert any(item["id"] == appointment_id for item in listed)

    reschedule_response = client.patch(
        f"/api/me/appointments/{appointment_id}/reschedule",
        headers=_auth_headers(patient),
        json={
            "scheduled_at": "2026-05-04T10:30:00Z",
            "notes": "Updated request",
        },
    )
    assert reschedule_response.status_code == 200
    assert reschedule_response.json()["status"] == "Pending"

    cancel_response = client.patch(
        f"/api/me/appointments/{appointment_id}/cancel",
        headers=_auth_headers(patient),
    )
    assert cancel_response.status_code == 200
    assert cancel_response.json()["status"] == "Cancelled"


def test_patient_notifications_read_and_read_all(client, db_session, user_factory):
    patient = user_factory(email="phase4.notif.patient@example.com", role="patient")

    crud._create_notification(
        db_session,
        user_id=patient.id,
        title="Reminder",
        body="You have an upcoming appointment.",
        kind="appointment",
    )
    crud._create_notification(
        db_session,
        user_id=patient.id,
        title="Chat",
        body="New chat response available.",
        kind="chat",
    )
    db_session.commit()

    list_response = client.get("/api/me/notifications", headers=_auth_headers(patient))
    assert list_response.status_code == 200
    notifications = list_response.json()
    assert len(notifications) == 2

    first_id = notifications[0]["id"]
    mark_one = client.patch(
        f"/api/me/notifications/{first_id}/read",
        headers=_auth_headers(patient),
    )
    assert mark_one.status_code == 200
    assert mark_one.json()["is_read"] is True

    mark_all = client.patch("/api/me/notifications/read-all", headers=_auth_headers(patient))
    assert mark_all.status_code == 200
    assert "Marked" in mark_all.json()["message"]

    unread_response = client.get(
        "/api/me/notifications?only_unread=true",
        headers=_auth_headers(patient),
    )
    assert unread_response.status_code == 200
    assert unread_response.json() == []


def test_patient_chat_messages_and_help_articles(client, user_factory):
    patient = user_factory(email="phase5.chat.patient@example.com", role="patient")

    empty_chat = client.get("/api/me/chat/messages", headers=_auth_headers(patient))
    assert empty_chat.status_code == 200
    assert empty_chat.json() == []

    send_response = client.post(
        "/api/me/chat/messages",
        headers=_auth_headers(patient),
        json={
            "message": "Hello, I need help with appointments.",
            "channel": "support",
        },
    )
    assert send_response.status_code == 200
    sent_payload = send_response.json()
    assert len(sent_payload) == 2
    assert sent_payload[0]["sender_type"] == "patient"
    assert sent_payload[1]["sender_type"] == "bot"

    list_chat = client.get("/api/me/chat/messages", headers=_auth_headers(patient))
    assert list_chat.status_code == 200
    assert len(list_chat.json()) == 2

    help_response = client.get("/api/help/articles", headers=_auth_headers(patient))
    assert help_response.status_code == 200
    payload = help_response.json()
    assert "items" in payload
    assert len(payload["items"]) >= 4


def test_patient_chat_schedule_reply_is_human_readable_and_mentions_unread_notifications(
    client,
    db_session,
    user_factory,
):
    patient = user_factory(email="phase5.schedule.chat@example.com", role="patient")

    next_appointment = crud.request_patient_appointment(
        db_session,
        patient,
        schemas.AppointmentRequestCreate(
            appointment_type="General Consultation",
            health_area="General",
            scheduled_at=datetime(2026, 6, 8, 8, 30, tzinfo=UTC),
            location="Barangay Health Center",
            notes="Schedule check",
        ),
    )
    next_appointment.status = "Confirmed"

    crud._create_notification(
        db_session,
        user_id=patient.id,
        title="Status Update",
        body="Your request was reviewed.",
        kind="appointment",
    )
    db_session.commit()

    response = client.post(
        "/api/me/chat/messages",
        headers=_auth_headers(patient),
        json={
            "message": "When is my next appointment?",
            "channel": "support",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    bot_reply = payload[1]["message"]
    assert "Your next appointment is General Consultation" in bot_reply
    assert "Its current status is Confirmed." in bot_reply
    assert "unread notifications" in bot_reply


def test_patient_chat_confirmation_reply_summarizes_pending_and_confirmed(
    client,
    db_session,
    user_factory,
):
    patient = user_factory(email="phase5.confirmation.chat@example.com", role="patient")

    confirmed = crud.request_patient_appointment(
        db_session,
        patient,
        schemas.AppointmentRequestCreate(
            appointment_type="Prenatal Checkup",
            health_area="Maternal",
            scheduled_at=datetime(2026, 6, 9, 9, 0, tzinfo=UTC),
            location="RHU Building",
            notes="Confirmation query",
        ),
    )
    confirmed.status = "Confirmed"

    crud.request_patient_appointment(
        db_session,
        patient,
        schemas.AppointmentRequestCreate(
            appointment_type="Follow-up",
            health_area="General",
            scheduled_at=datetime(2026, 6, 11, 11, 0, tzinfo=UTC),
            location="Barangay Health Center",
            notes="Still pending",
        ),
    )
    db_session.commit()

    response = client.post(
        "/api/me/chat/messages",
        headers=_auth_headers(patient),
        json={
            "message": "Is my appointment confirmed?",
            "channel": "support",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    bot_reply = payload[1]["message"]
    assert "Confirmed appointments: 1." in bot_reply
    assert "Pending appointments: 1." in bot_reply
    assert "waiting for staff confirmation" in bot_reply


def test_patient_chat_schedule_reply_handles_no_appointments(client, user_factory):
    patient = user_factory(email="phase5.no.appointments@example.com", role="patient")

    response = client.post(
        "/api/me/chat/messages",
        headers=_auth_headers(patient),
        json={
            "message": "Can you tell me my schedule?",
            "channel": "support",
        },
    )

    assert response.status_code == 200
    bot_reply = response.json()[1]["message"]
    assert "I could not find any upcoming pending or confirmed appointments" in bot_reply
    assert "request one from the Schedules page" in bot_reply


def test_patient_chat_reschedule_cancel_guidance_reply(client, user_factory):
    patient = user_factory(email="phase5.reschedule.chat@example.com", role="patient")

    response = client.post(
        "/api/me/chat/messages",
        headers=_auth_headers(patient),
        json={
            "message": "How do I reschedule or cancel my appointment?",
            "channel": "support",
        },
    )

    assert response.status_code == 200
    bot_reply = response.json()[1]["message"]
    assert "To reschedule or cancel, open the Schedules page" in bot_reply
    assert "Rescheduled requests return to Pending" in bot_reply


def test_patient_chat_fallback_reply_stays_text_only(client, user_factory):
    patient = user_factory(email="phase5.fallback.chat@example.com", role="patient")

    response = client.post(
        "/api/me/chat/messages",
        headers=_auth_headers(patient),
        json={
            "message": "Can you tell me a joke?",
            "channel": "support",
        },
    )

    assert response.status_code == 200
    bot_reply = response.json()[1]["message"]
    assert "I can currently help with appointment schedules and confirmation concerns" in bot_reply
    assert "http://" not in bot_reply
    assert "https://" not in bot_reply


def test_phase4_5_endpoints_require_auth(client):
    response = client.get("/api/me/appointments")
    assert response.status_code == 401

    response = client.post(
        "/api/me/appointments/request",
        json={
            "appointment_type": "General Consultation",
            "health_area": "General",
            "scheduled_at": "2026-05-03T09:00:00Z",
            "location": "Barangay Health Center",
            "notes": "Auth required",
        },
    )
    assert response.status_code == 401

    response = client.get("/api/me/notifications")
    assert response.status_code == 401

    response = client.get("/api/me/chat/messages")
    assert response.status_code == 401

    response = client.get("/api/help/articles")
    assert response.status_code == 401


def test_patient_cannot_modify_other_patient_resources(client, db_session, user_factory):
    patient_one = user_factory(email="owner.one@example.com", role="patient")
    patient_two = user_factory(email="owner.two@example.com", role="patient")

    other_appointment = crud.request_patient_appointment(
        db_session,
        patient_two,
        schemas.AppointmentRequestCreate(
            appointment_type="Follow-up",
            health_area="General",
            scheduled_at=datetime(2026, 5, 10, 9, 0, tzinfo=UTC),
            location="Barangay Health Center",
            notes="Other patient record",
        ),
    )

    other_notification = crud._create_notification(
        db_session,
        user_id=patient_two.id,
        title="Private Notification",
        body="Only owner should access this.",
        kind="general",
    )
    db_session.commit()

    cancel_response = client.patch(
        f"/api/me/appointments/{other_appointment.id}/cancel",
        headers=_auth_headers(patient_one),
    )
    assert cancel_response.status_code == 404

    reschedule_response = client.patch(
        f"/api/me/appointments/{other_appointment.id}/reschedule",
        headers=_auth_headers(patient_one),
        json={
            "scheduled_at": "2026-05-11T10:00:00Z",
            "notes": "Should fail",
        },
    )
    assert reschedule_response.status_code == 404

    mark_notification_response = client.patch(
        f"/api/me/notifications/{other_notification.id}/read",
        headers=_auth_headers(patient_one),
    )
    assert mark_notification_response.status_code == 404

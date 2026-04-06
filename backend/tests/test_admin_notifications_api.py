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
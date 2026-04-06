import pytest
from fastapi import HTTPException

from app import crud, security


def test_authenticate_user_migrates_legacy_hash(db_session, user_factory):
    legacy_password = "LegacyPass1!"
    user = user_factory(
        email="legacy.admin@example.com",
        role="admin",
        hashed_password=f"{legacy_password}_hashed",
    )

    authenticated = crud.authenticate_user(db_session, user.email, legacy_password)

    assert authenticated is not None
    db_session.refresh(user)
    assert user.hashed_password != f"{legacy_password}_hashed"
    assert security.verify_password(legacy_password, user.hashed_password)


def test_get_current_user_from_valid_token(db_session, user_factory):
    admin = user_factory(email="token.admin@example.com", role="admin")
    token = security.create_access_token({"sub": str(admin.id), "role": "admin"})

    current_user = security.get_current_user(token=token, db=db_session)

    assert current_user.id == admin.id


def test_require_admin_rejects_non_admin(user_factory):
    patient = user_factory(email="patient.only@example.com", role="patient")

    with pytest.raises(HTTPException) as exc_info:
        security.require_admin(patient)

    assert exc_info.value.status_code == 403
    assert "Admin access required" in str(exc_info.value.detail)

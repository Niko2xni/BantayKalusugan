import os
from datetime import date

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure imports succeed in CI environments that do not have a local .env file.
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

from app import models
from app.security import get_password_hash


@pytest.fixture(scope="session")
def engine():
    test_engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    models.Base.metadata.create_all(bind=test_engine)
    return test_engine


@pytest.fixture()
def db_session(engine):
    connection = engine.connect()
    transaction = connection.begin()
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=connection)
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def user_factory(db_session):
    counter = {"value": 1}

    def _create_user(
        *,
        first_name="Test",
        last_name="User",
        email=None,
        phone=None,
        role="patient",
        password="Password1!",
        hashed_password=None,
    ):
        idx = counter["value"]
        counter["value"] += 1

        user = models.User(
            first_name=first_name,
            last_name=last_name,
            email=email or f"user{idx}@example.com",
            phone=phone or f"0917{idx:07d}",
            date_of_birth=date(1990, 1, 1),
            sex="Male",
            address="Zone 1",
            barangay="Unknown",
            hashed_password=hashed_password or get_password_hash(password),
            role=role,
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _create_user

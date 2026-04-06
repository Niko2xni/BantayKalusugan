from datetime import date, timedelta

import pytest

from app import crud, models, schemas, security


def _recent_month_midpoints(count):
    points = []
    cursor = date.today().replace(day=15)
    for _ in range(count):
        points.append(cursor)
        cursor = (cursor.replace(day=1) - timedelta(days=1)).replace(day=15)
    points.reverse()
    return points


def test_report_queries_and_csv_export(db_session, user_factory):
    admin = user_factory(email="admin.reports@example.com", role="admin")
    patients = [
        user_factory(email="patient.report.1@example.com", role="patient"),
        user_factory(email="patient.report.2@example.com", role="patient"),
    ]

    month_points = _recent_month_midpoints(3)

    for month_idx, month_point in enumerate(month_points):
        for patient_idx, patient in enumerate(patients):
            crud.create_vital_sign(
                db_session,
                schemas.VitalSignCreate(
                    patient_id=patient.id,
                    date=month_point.isoformat(),
                    time="09:00",
                    systolic=120 + month_idx * 5 + patient_idx,
                    diastolic=80 + month_idx * 2,
                    heart_rate=70 + patient_idx,
                    temperature=36.7,
                    spo2=98,
                    respiratory_rate=16,
                    weight=64.0 + patient_idx,
                    height=166.0,
                    recorded_by="Admin Staff",
                ),
                admin.id,
            )

    trends = crud.get_report_trends(db_session, date_range="last3Months")
    overview = crud.get_report_overview(db_session, date_range="last3Months")
    distributions = crud.get_report_distributions(db_session, date_range="last3Months")

    assert len(trends["monthly_summary"]) == 3
    assert overview["total_patients"] >= 2
    assert any(item["name"] == "Normal" for item in distributions["health_conditions"])

    csv_data = crud.export_report_csv(
        db=db_session,
        current_admin=admin,
        report_type="overview",
        date_range="last3Months",
    )

    assert "Overview Metrics" in csv_data
    assert "Report Type,overview" in csv_data

    export_audit_log = (
        db_session.query(models.AuditLog)
        .filter(models.AuditLog.target_type == "Report")
        .order_by(models.AuditLog.id.desc())
        .first()
    )
    assert export_audit_log is not None
    assert "Exported overview report" in export_audit_log.details


def test_settings_and_password_change_flow(db_session, user_factory):
    current_password = "CurrentPass1!"
    admin = user_factory(
        email="admin.settings@example.com",
        role="admin",
        hashed_password=security.get_password_hash(current_password),
    )

    defaults = crud.get_system_settings(db_session)
    assert defaults["timezone"] == "Asia/Manila"

    updated_settings = crud.update_system_settings(
        db_session,
        admin,
        schemas.SystemSettings(
            language="en",
            timezone="UTC",
            date_format="YYYY-MM-DD",
            notifications=True,
            email_alerts=False,
            auto_backup=True,
        ),
    )

    assert updated_settings["timezone"] == "UTC"
    persisted_settings = crud.get_system_settings(db_session)
    assert persisted_settings["timezone"] == "UTC"

    with pytest.raises(PermissionError):
        crud.change_admin_password(
            db_session,
            admin,
            schemas.PasswordChangeRequest(
                current_password="WrongPass1!",
                new_password="NewStrong1!",
                confirm_password="NewStrong1!",
            ),
        )

    with pytest.raises(ValueError):
        crud.change_admin_password(
            db_session,
            admin,
            schemas.PasswordChangeRequest(
                current_password=current_password,
                new_password="weak",
                confirm_password="weak",
            ),
        )

    crud.change_admin_password(
        db_session,
        admin,
        schemas.PasswordChangeRequest(
            current_password=current_password,
            new_password="NewStrong1!",
            confirm_password="NewStrong1!",
        ),
    )

    db_session.refresh(admin)
    assert security.verify_password("NewStrong1!", admin.hashed_password)

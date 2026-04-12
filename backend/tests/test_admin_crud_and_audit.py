from app import crud, models, schemas


def test_patient_crud_writes_audit_logs(db_session, user_factory):
    admin = user_factory(email="admin.audit@example.com", role="admin")

    created_patient = crud.create_user_admin(
        db_session,
        schemas.AdminUserCreate(
            first_name="Ana",
            last_name="Patient",
            email="ana.patient@example.com",
            phone="09999990001",
            date_of_birth="1992-05-10",
            sex="Female",
            address="Zone 2",
            barangay="Unknown",
        ),
        admin.id,
    )

    updated_patient = crud.update_user(
        db_session,
        created_patient.id,
        schemas.UserUpdate(first_name="Anna", address="Zone 3"),
        admin.id,
    )

    deleted_patient = crud.delete_user(db_session, created_patient.id, admin.id)

    assert created_patient.role == "patient"
    assert updated_patient.first_name == "Anna"
    assert deleted_patient is not None

    logs = (
        db_session.query(models.AuditLog)
        .filter(models.AuditLog.target_type == "Patient Record")
        .all()
    )
    actions = {log.action for log in logs}
    assert {"Added", "Updated", "Deleted"}.issubset(actions)


def test_vital_crud_writes_audit_logs(db_session, user_factory):
    admin = user_factory(email="admin.vitals@example.com", role="admin")
    patient = user_factory(email="patient.vitals@example.com", role="patient")

    vital = crud.create_vital_sign(
        db_session,
        schemas.VitalSignCreate(
            patient_id=patient.id,
            date="2026-04-06",
            time="08:30",
            systolic=135,
            diastolic=88,
            heart_rate=74,
            temperature=36.8,
            spo2=98,
            respiratory_rate=16,
            weight=65.2,
            height=167.0,
            recorded_by="Admin Staff",
        ),
        admin.id,
    )

    deleted = crud.delete_vital_sign(db_session, vital.id, admin.id)

    assert deleted is not None

    logs = (
        db_session.query(models.AuditLog)
        .filter(models.AuditLog.target_type == "Vital Signs")
        .all()
    )
    actions = {log.action for log in logs}
    assert {"Added", "Deleted"}.issubset(actions)

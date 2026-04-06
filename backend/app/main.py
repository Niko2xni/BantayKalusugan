from datetime import date

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Literal, Optional

from . import crud, models, schemas, security
from .database import engine, get_db

# Create all database tables (this is a simple way, but Alembic is better for production)
# We will still set up Alembic, but this ensures tables exist for initial testing
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BantayKalusugan API")

# --- CORS Configuration ---
# This is REQUIRED for your React frontend (running on another port) to communicate with this backend.
origins = [
    "http://localhost:5173",  # Default Vite Dev Server port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _serialize_vital(vital: models.VitalSign, patient_name: str):
    return {
        **{column.name: getattr(vital, column.name) for column in vital.__table__.columns},
        "patient_name": patient_name,
    }


# --- API Routes ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the BantayKalusugan API!"}

@app.post("/api/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Block admin domain from public registration
    if user.email.lower().endswith("@bantaykalusugan.com"):
        raise HTTPException(status_code=400, detail="This email domain is reserved for admin accounts. Please use a different email.")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        if db_user.hashed_password == "PENDING_REGISTRATION":
            # Claim Account flow
            db_user.hashed_password = security.get_password_hash(user.password)
            db.commit()
            db.refresh(db_user)
            return db_user
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_phone = crud.get_user_by_phone(db, phone=user.phone)
    if db_phone:
        if db_phone.hashed_password == "PENDING_REGISTRATION":
            # Claim Account flow
            db_phone.hashed_password = security.get_password_hash(user.password)
            db.commit()
            db.refresh(db_phone)
            return db_phone
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    return crud.create_user(db=db, user=user)

@app.get("/api/users/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/api/users/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/api/login/", response_model=schemas.LoginResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = security.create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    return schemas.LoginResponse(
        message="Login successful",
        user=user,
        access_token=access_token,
        token_type="bearer",
    )


@app.get("/api/me", response_model=schemas.User)
def read_current_user(
    current_user: models.User = Depends(security.get_current_user),
):
    return current_user


@app.put("/api/me", response_model=schemas.User)
def update_current_user_profile(
    profile_update: schemas.CurrentUserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    try:
        return crud.update_current_user_profile(db, current_user, profile_update)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/me/change-password", response_model=schemas.MessageResponse)
def change_current_user_password(
    password_data: schemas.PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    try:
        crud.change_user_password(db, current_user, password_data)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"message": "Password updated successfully"}


@app.get("/api/me/vitals", response_model=List[schemas.VitalSign])
def read_current_patient_vitals(
    skip: int = 0,
    limit: int = 500,
    date_start: date | None = None,
    date_end: date | None = None,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    vitals = crud.get_vital_signs_by_patient_filtered(
        db,
        patient_id=current_patient.id,
        skip=skip,
        limit=limit,
        date_start=date_start,
        date_end=date_end,
    )
    patient_name = f"{current_patient.first_name} {current_patient.last_name}".strip()
    return [_serialize_vital(vital, patient_name) for vital in vitals]


@app.get("/api/me/vitals/latest", response_model=Optional[schemas.VitalSign])
def read_current_patient_latest_vital(
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    latest_vital = crud.get_latest_vital_sign_by_patient(db, patient_id=current_patient.id)
    if latest_vital is None:
        return None

    patient_name = f"{current_patient.first_name} {current_patient.last_name}".strip()
    return _serialize_vital(latest_vital, patient_name)


@app.get("/api/me/analytics/overview", response_model=schemas.PatientAnalyticsOverview)
def read_current_patient_analytics_overview(
    date_start: date | None = None,
    date_end: date | None = None,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    return crud.get_patient_analytics_overview(
        db,
        patient_id=current_patient.id,
        date_start=date_start,
        date_end=date_end,
    )


@app.get("/api/me/vitals/export")
def export_current_patient_vitals_csv(
    format: Literal["csv", "pdf"] = "csv",
    date_start: date | None = None,
    date_end: date | None = None,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    if format == "pdf":
        raise HTTPException(status_code=501, detail="PDF export is not implemented yet")

    csv_content = crud.export_patient_vitals_csv(
        db,
        patient=current_patient,
        date_start=date_start,
        date_end=date_end,
    )
    filename = f"my-vitals-{date.today().isoformat()}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/me/appointments", response_model=List[schemas.Appointment])
def read_current_patient_appointments(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    normalized_status = status.title() if status else None
    return crud.get_patient_appointments(
        db,
        patient_id=current_patient.id,
        status=normalized_status,
    )


@app.post("/api/me/appointments/request", response_model=schemas.Appointment)
def request_current_patient_appointment(
    payload: schemas.AppointmentRequestCreate,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    return crud.request_patient_appointment(db, current_patient, payload)


@app.patch("/api/me/appointments/{appointment_id}/cancel", response_model=schemas.Appointment)
def cancel_current_patient_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    try:
        return crud.cancel_patient_appointment(db, current_patient, appointment_id)
    except ValueError as exc:
        detail = str(exc)
        status_code = 404 if "not found" in detail.lower() else 400
        raise HTTPException(status_code=status_code, detail=detail)


@app.patch("/api/me/appointments/{appointment_id}/reschedule", response_model=schemas.Appointment)
def reschedule_current_patient_appointment(
    appointment_id: int,
    payload: schemas.AppointmentRescheduleRequest,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    try:
        return crud.reschedule_patient_appointment(db, current_patient, appointment_id, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = 404 if "not found" in detail.lower() else 400
        raise HTTPException(status_code=status_code, detail=detail)


@app.get("/api/me/notifications", response_model=List[schemas.Notification])
def read_current_patient_notifications(
    only_unread: bool = False,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    return crud.get_patient_notifications(
        db,
        user_id=current_patient.id,
        only_unread=only_unread,
    )


@app.patch("/api/me/notifications/{notification_id}/read", response_model=schemas.Notification)
def mark_current_patient_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    try:
        return crud.mark_notification_as_read(db, current_patient.id, notification_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.patch("/api/me/notifications/read-all", response_model=schemas.MessageResponse)
def mark_current_patient_notifications_read_all(
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    count = crud.mark_all_notifications_as_read(db, current_patient.id)
    return {"message": f"Marked {count} notifications as read"}


@app.get("/api/me/chat/messages", response_model=List[schemas.ChatMessage])
def read_current_patient_chat_messages(
    channel: str = "support",
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    return crud.get_chat_messages(db, user_id=current_patient.id, channel=channel)


@app.post("/api/me/chat/messages", response_model=List[schemas.ChatMessage])
def create_current_patient_chat_message(
    payload: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_patient: models.User = Depends(security.require_patient),
):
    try:
        return crud.create_chat_message_with_reply(db, user_id=current_patient.id, payload=payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/api/help/articles")
def read_help_articles(
    current_patient: models.User = Depends(security.require_patient),
):
    return {"items": crud.get_help_articles()}


# --- Patient Endpoints (for Admin Dashboard) ---

@app.get("/api/patients/", response_model=List[schemas.User])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    """Get only patient-role users (excludes admins)."""
    return crud.get_patients(db, skip=skip, limit=limit)

@app.post("/api/patients/", response_model=schemas.User)
def admin_create_patient(
    user: schemas.AdminUserCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_phone = crud.get_user_by_phone(db, phone=user.phone)
    if db_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    return crud.create_user_admin(db=db, user=user, admin_id=current_admin.id)

@app.put("/api/patients/{user_id}", response_model=schemas.User)
def admin_update_patient(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    db_user = crud.update_user(
        db=db,
        user_id=user_id,
        user_update=user_update,
        admin_id=current_admin.id,
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_user

@app.delete("/api/patients/{user_id}")
def admin_delete_patient(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    db_user = crud.delete_user(db, user_id=user_id, admin_id=current_admin.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient records fully deleted"}

@app.get("/api/admin/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.get_community_analytics(db)


@app.get("/api/admin/reports/overview", response_model=schemas.ReportOverviewResponse)
def get_reports_overview(
    date_range: Literal["thisMonth", "lastMonth", "last3Months", "last6Months", "thisYear"] = "thisMonth",
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.get_report_overview(db, date_range=date_range)


@app.get("/api/admin/reports/trends", response_model=schemas.ReportTrendsResponse)
def get_reports_trends(
    date_range: Literal["thisMonth", "lastMonth", "last3Months", "last6Months", "thisYear"] = "thisMonth",
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.get_report_trends(db, date_range=date_range)


@app.get("/api/admin/reports/distributions", response_model=schemas.ReportDistributionsResponse)
def get_reports_distributions(
    date_range: Literal["thisMonth", "lastMonth", "last3Months", "last6Months", "thisYear"] = "thisMonth",
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.get_report_distributions(db, date_range=date_range)


@app.get("/api/admin/reports/export")
def export_report_csv(
    format: Literal["csv", "pdf"] = "csv",
    report_type: Literal["overview", "patients", "vitals", "conditions"] = "overview",
    date_range: Literal["thisMonth", "lastMonth", "last3Months", "last6Months", "thisYear"] = "thisMonth",
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    if format == "pdf":
        raise HTTPException(status_code=501, detail="PDF export is not implemented yet")

    csv_content = crud.export_report_csv(
        db=db,
        current_admin=current_admin,
        report_type=report_type,
        date_range=date_range,
    )
    filename = f"admin-report-{report_type}-{date_range}-{date.today().isoformat()}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.post("/api/admin/reports/log-generation", response_model=schemas.MessageResponse)
def log_report_generation(
    payload: schemas.ReportGenerationLogRequest,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    crud.log_report_generation(
        db=db,
        current_admin=current_admin,
        report_type=payload.report_type,
        date_range=payload.date_range,
    )
    return {"message": "Report generation logged"}


@app.get("/api/admin/audit-logs", response_model=schemas.PaginatedAuditLogs)
def get_admin_audit_logs(
    page: int = 1,
    page_size: int = 50,
    action: str | None = None,
    target_type: str | None = None,
    actor_id: int | None = None,
    date_start: date | None = None,
    date_end: date | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.get_paginated_audit_logs(
        db,
        page=page,
        page_size=page_size,
        action=action,
        target_type=target_type,
        actor_id=actor_id,
        date_start=date_start,
        date_end=date_end,
        search=search,
    )


@app.get("/api/admin/settings/profile", response_model=schemas.AdminProfileSettings)
def get_admin_profile_settings(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.get_admin_profile_settings(current_admin)


@app.put("/api/admin/settings/profile", response_model=schemas.AdminProfileSettings)
def update_admin_profile_settings(
    profile: schemas.AdminProfileSettings,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    try:
        return crud.update_admin_profile_settings(db, current_admin, profile)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/api/admin/settings/barangay", response_model=schemas.BarangaySettings)
def get_admin_barangay_settings(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.get_barangay_settings(db)


@app.put("/api/admin/settings/barangay", response_model=schemas.BarangaySettings)
def update_admin_barangay_settings(
    barangay: schemas.BarangaySettings,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.update_barangay_settings(db, current_admin, barangay)


@app.get("/api/admin/settings/system", response_model=schemas.SystemSettings)
def get_admin_system_settings(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.get_system_settings(db)


@app.put("/api/admin/settings/system", response_model=schemas.SystemSettings)
def update_admin_system_settings(
    settings: schemas.SystemSettings,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    return crud.update_system_settings(db, current_admin, settings)


@app.post("/api/admin/settings/change-password", response_model=schemas.MessageResponse)
def change_admin_password(
    password_data: schemas.PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    try:
        crud.change_admin_password(db, current_admin, password_data)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"message": "Password updated successfully"}



# --- Vital Signs Endpoints ---

@app.post("/api/vitals/")
def create_vital_sign(
    vital: schemas.VitalSignCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    # Verify patient exists
    patient = crud.get_user(db, user_id=vital.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db_vital = crud.create_vital_sign(db=db, vital=vital, admin_id=current_admin.id)
    # Return with patient name attached
    return _serialize_vital(db_vital, f"{patient.first_name} {patient.last_name}".strip())

@app.get("/api/vitals/")
def read_vital_signs(
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    """Get all vital sign records with patient names."""
    vitals = crud.get_vital_signs(db, skip=skip, limit=limit)
    results = []
    for v in vitals:
        patient = crud.get_user(db, user_id=v.patient_id)
        patient_name = f"{patient.first_name} {patient.last_name}" if patient else "Unknown"
        results.append(_serialize_vital(v, patient_name))
    return results

@app.get("/api/vitals/{patient_id}")
def read_patient_vitals(
    patient_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    """Get vital signs for a specific patient."""
    patient = crud.get_user(db, user_id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    vitals = crud.get_vital_signs_by_patient(db, patient_id=patient_id)
    results = []
    for v in vitals:
        results.append(_serialize_vital(v, f"{patient.first_name} {patient.last_name}".strip()))
    return results

@app.delete("/api/vitals/{vital_id}")
def delete_vital_sign(
    vital_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    vital = crud.delete_vital_sign(db, vital_id=vital_id, admin_id=current_admin.id)
    if not vital:
        raise HTTPException(status_code=404, detail="Vital sign record not found")
    return {"message": "Vital sign record deleted"}

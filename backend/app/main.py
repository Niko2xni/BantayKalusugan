from datetime import date

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Literal

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
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/api/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
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
    return {
        **{c.name: getattr(db_vital, c.name) for c in db_vital.__table__.columns},
        "patient_name": f"{patient.first_name} {patient.last_name}",
    }

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
        results.append({
            **{c.name: getattr(v, c.name) for c in v.__table__.columns},
            "patient_name": patient_name,
        })
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
        results.append({
            **{c.name: getattr(v, c.name) for c in v.__table__.columns},
            "patient_name": f"{patient.first_name} {patient.last_name}",
        })
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

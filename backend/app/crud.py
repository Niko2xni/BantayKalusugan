import csv
import io
import json
from collections import defaultdict
from datetime import date, datetime, time, timedelta

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from . import models, schemas
from .security import get_password_hash, verify_password


BARANGAY_SETTINGS_KEY = "barangay_info"
SYSTEM_SETTINGS_KEY = "system_preferences"


def _safe_round(value: float | None, digits: int = 1) -> float:
    return round(float(value), digits) if value is not None else 0.0


def _classify_bp(systolic: int, diastolic: int) -> str:
    if systolic >= 140 or diastolic >= 90:
        return "High Risk"
    if systolic >= 130 or diastolic >= 85:
        return "Hypertensive"
    if systolic >= 120 or diastolic >= 80:
        return "Under Monitoring"
    return "Normal"


def _month_starts_for_range(date_range: str) -> list[date]:
    today = date.today()
    first_this_month = today.replace(day=1)

    if date_range == "thisMonth":
        return [first_this_month]

    if date_range == "lastMonth":
        last_month = (first_this_month - timedelta(days=1)).replace(day=1)
        return [last_month]

    if date_range == "thisYear":
        return [date(today.year, month, 1) for month in range(1, today.month + 1)]

    month_count = 6
    if date_range == "last3Months":
        month_count = 3

    months: list[date] = []
    current = first_this_month
    for _ in range(month_count):
        months.append(current)
        current = (current - timedelta(days=1)).replace(day=1)
    months.reverse()
    return months


def _month_key(d: date) -> str:
    return d.strftime("%Y-%m")


def _month_label(month_key: str) -> str:
    return datetime.strptime(f"{month_key}-01", "%Y-%m-%d").strftime("%b")


def _month_range_bounds(month_starts: list[date]) -> tuple[str, str]:
    start_date = month_starts[0]
    last_month = month_starts[-1]
    next_month = (last_month.replace(day=28) + timedelta(days=4)).replace(day=1)
    end_date = next_month - timedelta(days=1)
    return start_date.isoformat(), end_date.isoformat()


def _calculate_age(dob: date | None) -> int | None:
    if dob is None:
        return None

    today = date.today()
    years = today.year - dob.year
    if (today.month, today.day) < (dob.month, dob.day):
        years -= 1
    return years


def _get_setting(db: Session, key: str, default_value):
    setting = db.query(models.AdminSetting).filter(models.AdminSetting.key == key).first()
    if not setting:
        return default_value

    try:
        return json.loads(setting.value)
    except json.JSONDecodeError:
        return default_value


def _set_setting(db: Session, key: str, value) -> None:
    serialized_value = json.dumps(value)
    setting = db.query(models.AdminSetting).filter(models.AdminSetting.key == key).first()
    if setting:
        setting.value = serialized_value
    else:
        db.add(models.AdminSetting(key=key, value=serialized_value))


def _default_barangay_settings() -> dict:
    return {
        "name": "Barangay San Antonio",
        "municipality": "Quezon City",
        "province": "Metro Manila",
        "address": "123 Barangay Hall Road, San Antonio, Quezon City",
        "contact_number": "+63 2 1234 5678",
    }


def _default_system_settings() -> dict:
    return {
        "language": "en",
        "timezone": "Asia/Manila",
        "date_format": "MM/DD/YYYY",
        "notifications": True,
        "email_alerts": True,
        "auto_backup": True,
    }


def _validate_password_strength(password: str) -> str | None:
    if len(password) < 8:
        return "Password must be at least 8 characters long"
    if password.lower() == password or password.upper() == password:
        return "Password must include both uppercase and lowercase letters"
    if not any(ch.isdigit() for ch in password):
        return "Password must include at least one number"
    if not any(not ch.isalnum() for ch in password):
        return "Password must include at least one special character"
    return None

# Get a single user by ID
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# Get a single user by email
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# Get a single user by phone number
def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

# Get multiple users (with pagination)
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# Create a new user from the registration form data
def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)

    db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        date_of_birth=user.date_of_birth,
        sex=user.sex,
        address=user.address,
        barangay=user.barangay,
        hashed_password=hashed_password,
        is_active=True,               # Account is active immediately
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

# Authenticate a user by email and password
def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None

    if user.hashed_password == "PENDING_REGISTRATION":
        return None

    # Compatibility path for legacy plain+suffix hashes. Once verified,
    # migrate the account to bcrypt automatically.
    legacy_hash = password + "_hashed"
    if user.hashed_password == legacy_hash:
        user.hashed_password = get_password_hash(password)
        db.commit()
        db.refresh(user)
        return user

    if not verify_password(password, user.hashed_password):
        return None

    return user

# --- Patient queries ---

# Get only patient-role users (for admin dashboard)
def get_patients(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.User)
        .filter(models.User.role == "patient")
        .order_by(models.User.created_at.desc(), models.User.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

# --- Audit Logs ---

def create_audit_log(db: Session, admin_id: int, action: str, target_id: int, target_type: str, details: str):
    # Verify admin_id exists to avoid ForeignKeyViolation
    admin = db.query(models.User).filter(models.User.id == admin_id, models.User.role == "admin").first()
    if not admin:
        # If the provided admin_id doesn't exist, use the first available admin
        admin = db.query(models.User).filter(models.User.role == "admin").first()
    
    if not admin:
        # If no admin exists in the system at all, we can't create an audit log (should not happen normally)
        return None

    db_log = models.AuditLog(
        admin_id=admin.id,
        action=action,
        target_id=target_id,
        target_type=target_type,
        details=details
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_audit_logs(db: Session, skip: int = 0, limit: int = 500):
    # Get latest logs first
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()


def get_paginated_audit_logs(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    action: str | None = None,
    target_type: str | None = None,
    actor_id: int | None = None,
    date_start: date | None = None,
    date_end: date | None = None,
    search: str | None = None,
):
    query = (
        db.query(
            models.AuditLog.id,
            models.AuditLog.admin_id,
            models.AuditLog.timestamp,
            models.AuditLog.action,
            models.AuditLog.target_id,
            models.AuditLog.target_type,
            models.AuditLog.details,
            models.User.first_name.label("admin_first_name"),
            models.User.last_name.label("admin_last_name"),
        )
        .outerjoin(models.User, models.AuditLog.admin_id == models.User.id)
    )

    if action and action != "All":
        query = query.filter(models.AuditLog.action == action)

    if target_type and target_type != "All":
        query = query.filter(models.AuditLog.target_type == target_type)

    if actor_id is not None:
        query = query.filter(models.AuditLog.admin_id == actor_id)

    if date_start is not None:
        start_dt = datetime.combine(date_start, time.min)
        query = query.filter(models.AuditLog.timestamp >= start_dt)

    if date_end is not None:
        end_dt = datetime.combine(date_end, time.max)
        query = query.filter(models.AuditLog.timestamp <= end_dt)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.AuditLog.details.ilike(term),
                models.User.first_name.ilike(term),
                models.User.last_name.ilike(term),
            )
        )

    total = query.count()
    offset = max(page - 1, 0) * page_size
    rows = (
        query.order_by(models.AuditLog.timestamp.desc(), models.AuditLog.id.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    patient_ids = [row.target_id for row in rows if row.target_type == "Patient Record"]
    patient_name_map = {}
    if patient_ids:
        patients = db.query(models.User).filter(models.User.id.in_(patient_ids)).all()
        patient_name_map = {
            patient.id: f"{patient.first_name} {patient.last_name}".strip() for patient in patients
        }

    items = []
    for row in rows:
        admin_name = "Admin Staff"
        if row.admin_first_name or row.admin_last_name:
            admin_name = f"{row.admin_first_name or ''} {row.admin_last_name or ''}".strip()

        item = {
            "id": row.id,
            "admin_id": row.admin_id,
            "timestamp": row.timestamp,
            "action": row.action,
            "target_id": row.target_id,
            "target_type": row.target_type,
            "details": row.details,
            "admin_name": admin_name,
            "target_name": patient_name_map.get(row.target_id) if row.target_type == "Patient Record" else None,
        }
        items.append(item)

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }

# --- Admin Patient Management ---

def create_user_admin(db: Session, user: schemas.AdminUserCreate, admin_id: int):
    db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        date_of_birth=user.date_of_birth,
        sex=user.sex,
        address=user.address,
        barangay=user.barangay,
        hashed_password="PENDING_REGISTRATION",
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    create_audit_log(
        db=db,
        admin_id=admin_id,
        action="Added",
        target_id=db_user.id,
        target_type="Patient Record",
        details=f"Added patient {user.first_name} {user.last_name}"
    )
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate, admin_id: int):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    if update_data:
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)

        create_audit_log(
            db=db,
            admin_id=admin_id,
            action="Updated",
            target_id=db_user.id,
            target_type="Patient Record",
            details=f"Updated patient details for {db_user.first_name} {db_user.last_name}"
        )
    return db_user

def delete_user(db: Session, user_id: int, admin_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        name = f"{db_user.first_name} {db_user.last_name}"
        # Delete their vitals
        db.query(models.VitalSign).filter(models.VitalSign.patient_id == user_id).delete()
        # Delete the user
        db.delete(db_user)
        db.commit()

        create_audit_log(
            db=db,
            admin_id=admin_id,
            action="Deleted",
            target_id=user_id,
            target_type="Patient Record",
            details=f"Deleted patient {name} and their records"
        )
    return db_user

# --- VitalSign CRUD ---

def create_vital_sign(db: Session, vital: schemas.VitalSignCreate, admin_id: int):
    db_vital = models.VitalSign(
        patient_id=vital.patient_id,
        date=vital.date,
        time=vital.time,
        systolic=vital.systolic,
        diastolic=vital.diastolic,
        heart_rate=vital.heart_rate,
        temperature=vital.temperature,
        spo2=vital.spo2,
        respiratory_rate=vital.respiratory_rate,
        weight=vital.weight,
        height=vital.height,
        recorded_by=vital.recorded_by,
    )
    db.add(db_vital)
    db.commit()
    db.refresh(db_vital)
    
    create_audit_log(
        db=db,
        admin_id=admin_id,
        action="Added",
        target_id=db_vital.id,
        target_type="Vital Signs",
        details=f"Recorded vital signs for Patient {vital.patient_id}: BP {vital.systolic}/{vital.diastolic}, HR {vital.heart_rate}"
    )

    return db_vital

def get_vital_signs(db: Session, skip: int = 0, limit: int = 500):
    return db.query(models.VitalSign).offset(skip).limit(limit).all()

def get_vital_signs_by_patient(db: Session, patient_id: int):
    return db.query(models.VitalSign).filter(models.VitalSign.patient_id == patient_id).all()

def delete_vital_sign(db: Session, vital_id: int, admin_id: int):
    vital = db.query(models.VitalSign).filter(models.VitalSign.id == vital_id).first()
    if vital:
        patient_id = vital.patient_id
        db.delete(vital)
        db.commit()

        create_audit_log(
            db=db,
            admin_id=admin_id,
            action="Deleted",
            target_id=vital_id,
            target_type="Vital Signs",
            details=f"Deleted vital sign record for Patient {patient_id}"
        )
    return vital

# --- Analytics ---

def get_report_overview(db: Session, date_range: str = "last6Months"):
    month_starts = _month_starts_for_range(date_range)
    start_date, end_date = _month_range_bounds(month_starts)

    total_patients = db.query(models.User).filter(models.User.role == "patient").count()

    today = date.today().isoformat()
    bp_records_today = db.query(models.VitalSign).filter(models.VitalSign.date == today).count()

    visit_stats = (
        db.query(
            func.count(models.VitalSign.id).label("visits"),
            func.avg(models.VitalSign.systolic).label("avg_systolic"),
            func.avg(models.VitalSign.diastolic).label("avg_diastolic"),
        )
        .filter(and_(models.VitalSign.date >= start_date, models.VitalSign.date <= end_date))
        .first()
    )

    reports_generated = (
        db.query(models.AuditLog)
        .filter(models.AuditLog.target_type == "Report")
        .count()
    )

    return {
        "total_patients": total_patients,
        "bp_records_today": bp_records_today,
        "total_visits": int(visit_stats.visits or 0),
        "avg_systolic": _safe_round(visit_stats.avg_systolic),
        "avg_diastolic": _safe_round(visit_stats.avg_diastolic),
        "reports_generated": reports_generated,
    }


def get_report_trends(db: Session, date_range: str = "last6Months"):
    month_starts = _month_starts_for_range(date_range)
    month_keys = [_month_key(month_start) for month_start in month_starts]
    start_date, end_date = _month_range_bounds(month_starts)

    bp_rows = (
        db.query(
            func.substr(models.VitalSign.date, 1, 7).label("month_key"),
            func.avg(models.VitalSign.systolic).label("avg_systolic"),
            func.avg(models.VitalSign.diastolic).label("avg_diastolic"),
            func.count(models.VitalSign.id).label("visit_count"),
        )
        .filter(and_(models.VitalSign.date >= start_date, models.VitalSign.date <= end_date))
        .group_by("month_key")
        .all()
    )
    bp_by_month = {row.month_key: row for row in bp_rows}

    registration_counts = defaultdict(int)
    patient_rows = (
        db.query(models.User.created_at)
        .filter(models.User.role == "patient", models.User.created_at.isnot(None))
        .all()
    )
    for patient in patient_rows:
        month_key = patient.created_at.strftime("%Y-%m")
        if month_key in month_keys:
            registration_counts[month_key] += 1

    bp_trends = []
    registrations = []
    monthly_summary = []

    for month_key in month_keys:
        month_label = _month_label(month_key)
        bp_row = bp_by_month.get(month_key)

        systolic = int(round(float(bp_row.avg_systolic))) if bp_row and bp_row.avg_systolic is not None else 0
        diastolic = int(round(float(bp_row.avg_diastolic))) if bp_row and bp_row.avg_diastolic is not None else 0
        visits = int(bp_row.visit_count or 0) if bp_row else 0
        patient_count = int(registration_counts.get(month_key, 0))

        bp_trends.append({"month": month_label, "systolic": systolic, "diastolic": diastolic})
        registrations.append({"month": month_label, "patients": patient_count})
        monthly_summary.append(
            {
                "month": month_label,
                "patients": patient_count,
                "visits": visits,
                "avg_bp": systolic,
            }
        )

    return {
        "bp_trends": bp_trends,
        "registrations": registrations,
        "monthly_summary": monthly_summary,
    }


def get_report_distributions(db: Session, date_range: str = "last6Months"):
    month_starts = _month_starts_for_range(date_range)
    start_date, end_date = _month_range_bounds(month_starts)

    vitals = (
        db.query(models.VitalSign.systolic, models.VitalSign.diastolic)
        .filter(and_(models.VitalSign.date >= start_date, models.VitalSign.date <= end_date))
        .all()
    )

    condition_counts = {
        "Normal": 0,
        "Hypertensive": 0,
        "High Risk": 0,
        "Under Monitoring": 0,
    }

    for vital in vitals:
        condition = _classify_bp(vital.systolic, vital.diastolic)
        condition_counts[condition] += 1

    health_conditions = [
        {"name": "Normal", "value": condition_counts["Normal"]},
        {"name": "Hypertensive", "value": condition_counts["Hypertensive"]},
        {"name": "High Risk", "value": condition_counts["High Risk"]},
        {"name": "Under Monitoring", "value": condition_counts["Under Monitoring"]},
    ]

    age_ranges = {
        "18-30": 0,
        "31-45": 0,
        "46-60": 0,
        "61-75": 0,
        "76+": 0,
    }

    patients = db.query(models.User).filter(models.User.role == "patient").all()
    for patient in patients:
        age = _calculate_age(patient.date_of_birth)
        if age is None or age < 18:
            continue
        if age <= 30:
            age_ranges["18-30"] += 1
        elif age <= 45:
            age_ranges["31-45"] += 1
        elif age <= 60:
            age_ranges["46-60"] += 1
        elif age <= 75:
            age_ranges["61-75"] += 1
        else:
            age_ranges["76+"] += 1

    age_distribution = [
        {"range": "18-30", "count": age_ranges["18-30"]},
        {"range": "31-45", "count": age_ranges["31-45"]},
        {"range": "46-60", "count": age_ranges["46-60"]},
        {"range": "61-75", "count": age_ranges["61-75"]},
        {"range": "76+", "count": age_ranges["76+"]},
    ]

    return {
        "health_conditions": health_conditions,
        "age_distribution": age_distribution,
    }


def get_community_analytics(db: Session):
    overview = get_report_overview(db, date_range="last6Months")
    trends = get_report_trends(db, date_range="last6Months")
    return {
        **overview,
        "bp_trends": trends["bp_trends"],
        "registrations": trends["registrations"],
    }


def log_report_generation(
    db: Session,
    current_admin: models.User,
    report_type: str,
    date_range: str,
):
    create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="Added",
        target_id=current_admin.id,
        target_type="Report",
        details=f"Generated {report_type} report for {date_range}",
    )


def export_report_csv(
    db: Session,
    current_admin: models.User,
    report_type: str,
    date_range: str,
):
    overview = get_report_overview(db, date_range=date_range)
    trends = get_report_trends(db, date_range=date_range)
    distributions = get_report_distributions(db, date_range=date_range)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Report Type", report_type])
    writer.writerow(["Date Range", date_range])
    writer.writerow([])

    writer.writerow(["Overview Metrics"])
    writer.writerow(["Total Patients", overview["total_patients"]])
    writer.writerow(["BP Records Today", overview["bp_records_today"]])
    writer.writerow(["Total Visits", overview["total_visits"]])
    writer.writerow(["Average Systolic", overview["avg_systolic"]])
    writer.writerow(["Average Diastolic", overview["avg_diastolic"]])
    writer.writerow(["Reports Generated", overview["reports_generated"]])
    writer.writerow([])

    writer.writerow(["Monthly Summary"])
    writer.writerow(["Month", "Patients", "Visits", "Average Systolic BP"])
    for point in trends["monthly_summary"]:
        writer.writerow([point["month"], point["patients"], point["visits"], point["avg_bp"]])
    writer.writerow([])

    writer.writerow(["Blood Pressure Trends"])
    writer.writerow(["Month", "Avg Systolic", "Avg Diastolic"])
    for point in trends["bp_trends"]:
        writer.writerow([point["month"], point["systolic"], point["diastolic"]])
    writer.writerow([])

    writer.writerow(["Registration Trends"])
    writer.writerow(["Month", "New Patients"])
    for point in trends["registrations"]:
        writer.writerow([point["month"], point["patients"]])
    writer.writerow([])

    writer.writerow(["Health Condition Distribution"])
    writer.writerow(["Condition", "Count"])
    for point in distributions["health_conditions"]:
        writer.writerow([point["name"], point["value"]])
    writer.writerow([])

    writer.writerow(["Age Distribution"])
    writer.writerow(["Age Range", "Count"])
    for point in distributions["age_distribution"]:
        writer.writerow([point["range"], point["count"]])

    create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="Added",
        target_id=current_admin.id,
        target_type="Report",
        details=f"Exported {report_type} report for {date_range} as CSV",
    )

    return output.getvalue()


# --- Admin Settings ---

def get_admin_profile_settings(current_admin: models.User):
    full_name = f"{current_admin.first_name} {current_admin.last_name}".strip()
    display_role = "Administrator" if current_admin.role == "admin" else current_admin.role.title()
    return {
        "name": full_name,
        "email": current_admin.email,
        "phone": current_admin.phone,
        "role": display_role,
    }


def update_admin_profile_settings(
    db: Session,
    current_admin: models.User,
    profile: schemas.AdminProfileSettings,
):
    existing_email = (
        db.query(models.User)
        .filter(models.User.email == profile.email, models.User.id != current_admin.id)
        .first()
    )
    if existing_email:
        raise ValueError("Email is already used by another account")

    existing_phone = (
        db.query(models.User)
        .filter(models.User.phone == profile.phone, models.User.id != current_admin.id)
        .first()
    )
    if existing_phone:
        raise ValueError("Phone number is already used by another account")

    name_parts = profile.name.strip().split()
    if not name_parts:
        raise ValueError("Name cannot be empty")

    current_admin.first_name = name_parts[0]
    current_admin.last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "Staff"
    current_admin.email = profile.email
    current_admin.phone = profile.phone
    db.commit()
    db.refresh(current_admin)

    create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="Updated",
        target_id=current_admin.id,
        target_type="Settings",
        details="Updated profile settings",
    )

    return get_admin_profile_settings(current_admin)


def get_barangay_settings(db: Session):
    return _get_setting(db, BARANGAY_SETTINGS_KEY, _default_barangay_settings())


def update_barangay_settings(
    db: Session,
    current_admin: models.User,
    barangay: schemas.BarangaySettings,
):
    payload = barangay.model_dump()
    _set_setting(db, BARANGAY_SETTINGS_KEY, payload)
    db.commit()

    create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="Updated",
        target_id=current_admin.id,
        target_type="Settings",
        details="Updated barangay settings",
    )

    return payload


def get_system_settings(db: Session):
    return _get_setting(db, SYSTEM_SETTINGS_KEY, _default_system_settings())


def update_system_settings(
    db: Session,
    current_admin: models.User,
    settings: schemas.SystemSettings,
):
    payload = settings.model_dump()
    _set_setting(db, SYSTEM_SETTINGS_KEY, payload)
    db.commit()

    create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="Updated",
        target_id=current_admin.id,
        target_type="Settings",
        details="Updated system settings",
    )

    return payload


def change_admin_password(
    db: Session,
    current_admin: models.User,
    password_data: schemas.PasswordChangeRequest,
):
    if not verify_password(password_data.current_password, current_admin.hashed_password):
        raise PermissionError("Current password is incorrect")

    if password_data.new_password != password_data.confirm_password:
        raise ValueError("New password and confirm password do not match")

    if password_data.new_password == password_data.current_password:
        raise ValueError("New password must be different from current password")

    strength_error = _validate_password_strength(password_data.new_password)
    if strength_error:
        raise ValueError(strength_error)

    current_admin.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="Updated",
        target_id=current_admin.id,
        target_type="Settings",
        details="Changed account password",
    )


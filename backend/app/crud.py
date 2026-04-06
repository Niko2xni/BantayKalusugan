import csv
import io
import json
from collections import defaultdict
from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

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


def _classify_patient_bp_status(systolic: int, diastolic: int) -> str:
    if systolic >= 140 or diastolic >= 90:
        return "Abnormal"
    if systolic >= 120 or diastolic >= 80:
        return "Elevated"
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


def _create_notification(
    db: Session,
    user_id: int,
    title: str,
    body: str,
    kind: str = "general",
):
    notification = models.Notification(
        user_id=user_id,
        title=title,
        body=body,
        kind=kind,
        is_read=False,
    )
    db.add(notification)
    db.flush()
    return notification


def _format_appointment_title(appointment: models.Appointment) -> str:
    scheduled = appointment.scheduled_at.astimezone(UTC).strftime("%Y-%m-%d %H:%M UTC")
    return f"{appointment.appointment_type} on {scheduled}"

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


def update_current_user_profile(
    db: Session,
    current_user: models.User,
    profile_update: schemas.CurrentUserUpdate,
):
    update_data = profile_update.model_dump(exclude_unset=True)
    if not update_data:
        return current_user

    if "email" in update_data:
        email = update_data["email"].strip().lower()
        if current_user.role != "admin" and email.endswith("@bantaykalusugan.com"):
            raise ValueError("This email domain is reserved for admin accounts")

        existing_email = (
            db.query(models.User)
            .filter(models.User.email == email, models.User.id != current_user.id)
            .first()
        )
        if existing_email:
            raise ValueError("Email already registered")
        update_data["email"] = email

    if "phone" in update_data:
        phone = update_data["phone"].strip()
        if not phone:
            raise ValueError("Phone number cannot be empty")

        existing_phone = (
            db.query(models.User)
            .filter(models.User.phone == phone, models.User.id != current_user.id)
            .first()
        )
        if existing_phone:
            raise ValueError("Phone number already registered")
        update_data["phone"] = phone

    if "address" in update_data:
        address = update_data["address"].strip()
        if not address:
            raise ValueError("Address cannot be empty")
        update_data["address"] = address

    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user


def get_patient_appointments(
    db: Session,
    patient_id: int,
    status: str | None = None,
):
    query = db.query(models.Appointment).filter(models.Appointment.patient_id == patient_id)
    if status:
        query = query.filter(models.Appointment.status == status)

    return query.order_by(models.Appointment.scheduled_at.asc(), models.Appointment.id.asc()).all()


def request_patient_appointment(
    db: Session,
    patient: models.User,
    payload: schemas.AppointmentRequestCreate,
):
    appointment = models.Appointment(
        patient_id=patient.id,
        appointment_type=payload.appointment_type.strip(),
        health_area=payload.health_area.strip(),
        scheduled_at=payload.scheduled_at,
        status="Pending",
        location=payload.location.strip() if payload.location else "Barangay Health Center",
        assigned_staff="Pending Assignment",
        notes="",
        requested_notes=payload.notes.strip() if payload.notes else "",
    )
    db.add(appointment)
    db.flush()

    _create_notification(
        db,
        user_id=patient.id,
        title="Appointment requested",
        body=f"Your request for {_format_appointment_title(appointment)} was submitted.",
        kind="appointment",
    )

    db.commit()
    db.refresh(appointment)
    return appointment


def cancel_patient_appointment(
    db: Session,
    patient: models.User,
    appointment_id: int,
):
    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id, models.Appointment.patient_id == patient.id)
        .first()
    )
    if appointment is None:
        raise ValueError("Appointment not found")

    if appointment.status in {"Completed", "Cancelled"}:
        raise ValueError(f"Appointment is already {appointment.status.lower()}")

    appointment.status = "Cancelled"
    appointment.updated_at = datetime.now(UTC)

    _create_notification(
        db,
        user_id=patient.id,
        title="Appointment cancelled",
        body=f"Your {_format_appointment_title(appointment)} has been cancelled.",
        kind="appointment",
    )

    db.commit()
    db.refresh(appointment)
    return appointment


def reschedule_patient_appointment(
    db: Session,
    patient: models.User,
    appointment_id: int,
    payload: schemas.AppointmentRescheduleRequest,
):
    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id, models.Appointment.patient_id == patient.id)
        .first()
    )
    if appointment is None:
        raise ValueError("Appointment not found")

    if appointment.status in {"Completed", "Cancelled"}:
        raise ValueError(f"Appointment cannot be rescheduled because it is {appointment.status.lower()}")

    appointment.scheduled_at = payload.scheduled_at
    appointment.status = "Pending"
    appointment.requested_notes = payload.notes.strip() if payload.notes else appointment.requested_notes
    appointment.updated_at = datetime.now(UTC)

    _create_notification(
        db,
        user_id=patient.id,
        title="Appointment reschedule requested",
        body=f"Your appointment was moved to {_format_appointment_title(appointment)} and is pending confirmation.",
        kind="appointment",
    )

    db.commit()
    db.refresh(appointment)
    return appointment


def get_patient_notifications(
    db: Session,
    user_id: int,
    only_unread: bool = False,
):
    query = db.query(models.Notification).filter(models.Notification.user_id == user_id)
    if only_unread:
        query = query.filter(models.Notification.is_read.is_(False))

    return query.order_by(models.Notification.created_at.desc(), models.Notification.id.desc()).all()


def mark_notification_as_read(
    db: Session,
    user_id: int,
    notification_id: int,
):
    notification = (
        db.query(models.Notification)
        .filter(models.Notification.id == notification_id, models.Notification.user_id == user_id)
        .first()
    )
    if notification is None:
        raise ValueError("Notification not found")

    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now(UTC)
        db.commit()
        db.refresh(notification)

    return notification


def mark_all_notifications_as_read(
    db: Session,
    user_id: int,
) -> int:
    notifications = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user_id, models.Notification.is_read.is_(False))
        .all()
    )

    now = datetime.now(UTC)
    for notification in notifications:
        notification.is_read = True
        notification.read_at = now

    if notifications:
        db.commit()

    return len(notifications)


def get_chat_messages(
    db: Session,
    user_id: int,
    channel: str = "support",
):
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == user_id, models.ChatMessage.channel == channel)
        .order_by(models.ChatMessage.created_at.asc(), models.ChatMessage.id.asc())
        .all()
    )


def _build_bot_reply(message: str) -> str:
    lower_msg = message.lower()
    if "appointment" in lower_msg or "schedule" in lower_msg:
        return "For appointments, use the Schedules page to request, cancel, or reschedule, and check status updates there."
    if "vital" in lower_msg or "bp" in lower_msg or "blood pressure" in lower_msg:
        return "You can review your latest trends and complete vital history in Dashboard and Analytics."
    if "help" in lower_msg or "support" in lower_msg:
        return "I can answer common workflow questions. If this is urgent, please contact your barangay health center directly."
    if "hello" in lower_msg or "hi" in lower_msg:
        return "Hello. How can I assist you with your health portal today?"
    return "Thanks for your message. I have noted this and can help with appointments, vitals, and account usage questions."


def create_chat_message_with_reply(
    db: Session,
    user_id: int,
    payload: schemas.ChatMessageCreate,
):
    message_text = payload.message.strip()
    if not message_text:
        raise ValueError("Message cannot be empty")

    user_message = models.ChatMessage(
        user_id=user_id,
        sender_type="patient",
        message=message_text,
        channel=payload.channel,
    )
    db.add(user_message)
    db.flush()

    bot_message = models.ChatMessage(
        user_id=user_id,
        sender_type="bot",
        message=_build_bot_reply(message_text),
        channel=payload.channel,
    )
    db.add(bot_message)

    _create_notification(
        db,
        user_id=user_id,
        title="Support response available",
        body="A new support reply has been added to your chat.",
        kind="chat",
    )

    db.commit()
    db.refresh(user_message)
    db.refresh(bot_message)
    return [user_message, bot_message]


def get_help_articles():
    return [
        {
            "id": "getting-started",
            "title": "Getting Started",
            "subtitle": "New users logging in for the first time.",
            "content": "Use Dashboard for your latest summary, Analytics for trends, and Schedules for appointment actions.",
            "category": "onboarding",
        },
        {
            "id": "vitals",
            "title": "Vitals and Analytics",
            "subtitle": "Understanding your health records.",
            "content": "Analytics supports date filters and export so you can track BP, heart rate, temperature, SpO2, and BMI over time.",
            "category": "records",
        },
        {
            "id": "appointments",
            "title": "Appointments",
            "subtitle": "Requesting and managing schedules.",
            "content": "Go to Schedules to request a visit, then monitor pending, confirmed, completed, or cancelled statuses.",
            "category": "appointments",
        },
        {
            "id": "account",
            "title": "Account and Security",
            "subtitle": "Managing profile and sign-in safety.",
            "content": "Use Profile to update contact details and password. Your token session is required for all protected pages.",
            "category": "account",
        },
    ]

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
    return (
        db.query(models.VitalSign)
        .filter(models.VitalSign.patient_id == patient_id)
        .order_by(models.VitalSign.date.desc(), models.VitalSign.time.desc(), models.VitalSign.id.desc())
        .all()
    )


def _apply_vital_date_filters(query, date_start: date | None = None, date_end: date | None = None):
    if date_start is not None:
        query = query.filter(models.VitalSign.date >= date_start.isoformat())
    if date_end is not None:
        query = query.filter(models.VitalSign.date <= date_end.isoformat())
    return query


def get_vital_signs_by_patient_filtered(
    db: Session,
    patient_id: int,
    skip: int = 0,
    limit: int = 500,
    date_start: date | None = None,
    date_end: date | None = None,
):
    query = db.query(models.VitalSign).filter(models.VitalSign.patient_id == patient_id)
    query = _apply_vital_date_filters(query, date_start=date_start, date_end=date_end)

    return (
        query.order_by(models.VitalSign.date.desc(), models.VitalSign.time.desc(), models.VitalSign.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_latest_vital_sign_by_patient(
    db: Session,
    patient_id: int,
    date_start: date | None = None,
    date_end: date | None = None,
):
    query = db.query(models.VitalSign).filter(models.VitalSign.patient_id == patient_id)
    query = _apply_vital_date_filters(query, date_start=date_start, date_end=date_end)

    return query.order_by(
        models.VitalSign.date.desc(),
        models.VitalSign.time.desc(),
        models.VitalSign.id.desc(),
    ).first()


def get_patient_analytics_overview(
    db: Session,
    patient_id: int,
    date_start: date | None = None,
    date_end: date | None = None,
):
    base_query = db.query(models.VitalSign).filter(models.VitalSign.patient_id == patient_id)
    base_query = _apply_vital_date_filters(base_query, date_start=date_start, date_end=date_end)

    stats = base_query.with_entities(
        func.count(models.VitalSign.id).label("total_records"),
        func.avg(models.VitalSign.systolic).label("avg_systolic"),
        func.avg(models.VitalSign.diastolic).label("avg_diastolic"),
        func.avg(models.VitalSign.heart_rate).label("avg_heart_rate"),
        func.avg(models.VitalSign.temperature).label("avg_temperature"),
        func.avg(models.VitalSign.spo2).label("avg_spo2"),
        func.avg(models.VitalSign.respiratory_rate).label("avg_respiratory_rate"),
        func.avg(models.VitalSign.weight).label("avg_weight"),
        func.avg(models.VitalSign.height).label("avg_height"),
    ).first()

    bp_status_counts = {
        "Normal": 0,
        "Elevated": 0,
        "Abnormal": 0,
    }
    bp_rows = base_query.with_entities(models.VitalSign.systolic, models.VitalSign.diastolic).all()
    for row in bp_rows:
        bp_status = _classify_patient_bp_status(row.systolic, row.diastolic)
        bp_status_counts[bp_status] += 1

    return {
        "total_records": int(stats.total_records or 0),
        "avg_systolic": _safe_round(stats.avg_systolic),
        "avg_diastolic": _safe_round(stats.avg_diastolic),
        "avg_heart_rate": _safe_round(stats.avg_heart_rate),
        "avg_temperature": _safe_round(stats.avg_temperature),
        "avg_spo2": _safe_round(stats.avg_spo2),
        "avg_respiratory_rate": _safe_round(stats.avg_respiratory_rate),
        "avg_weight": _safe_round(stats.avg_weight),
        "avg_height": _safe_round(stats.avg_height),
        "normal_bp_records": bp_status_counts["Normal"],
        "elevated_bp_records": bp_status_counts["Elevated"],
        "abnormal_bp_records": bp_status_counts["Abnormal"],
    }


def export_patient_vitals_csv(
    db: Session,
    patient: models.User,
    date_start: date | None = None,
    date_end: date | None = None,
):
    vitals = get_vital_signs_by_patient_filtered(
        db,
        patient_id=patient.id,
        skip=0,
        limit=5000,
        date_start=date_start,
        date_end=date_end,
    )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Patient Name", f"{patient.first_name} {patient.last_name}".strip()])
    writer.writerow(["Patient Email", patient.email])
    writer.writerow(["Date Start", date_start.isoformat() if date_start else "All"])
    writer.writerow(["Date End", date_end.isoformat() if date_end else "All"])
    writer.writerow([])
    writer.writerow([
        "Date",
        "Time",
        "Systolic",
        "Diastolic",
        "Heart Rate",
        "Temperature",
        "SpO2",
        "Respiratory Rate",
        "Weight",
        "Height",
        "Recorded By",
    ])

    for vital in vitals:
        writer.writerow([
            vital.date,
            vital.time,
            vital.systolic,
            vital.diastolic,
            vital.heart_rate,
            vital.temperature,
            vital.spo2,
            vital.respiratory_rate,
            vital.weight,
            vital.height,
            vital.recorded_by,
        ])

    return output.getvalue()

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


def _format_report_type_label(report_type: str) -> str:
    report_labels = {
        "overview": "Overview Report",
        "patients": "Patient Statistics",
        "vitals": "Vital Signs Analysis",
        "conditions": "Health Conditions",
    }
    return report_labels.get(report_type, report_type.replace("_", " ").title())


def _get_report_export_data(db: Session, date_range: str):
    overview = get_report_overview(db, date_range=date_range)
    trends = get_report_trends(db, date_range=date_range)
    distributions = get_report_distributions(db, date_range=date_range)
    return overview, trends, distributions


def _build_pdf_table(rows: list[list[object]], col_widths: list[float] | None = None) -> Table:
    table = Table(rows, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E5895")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("LEADING", (0, 0), (-1, -1), 11),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D6DEE8")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FAFC")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def _append_pdf_section(
    story: list,
    section_title: str,
    headers: list[str],
    rows: list[list[object]],
    section_style,
    col_widths: list[float] | None = None,
):
    story.append(Paragraph(section_title, section_style))
    table_rows = [headers]
    table_rows.extend([[str(value) for value in row] for row in rows])
    story.append(_build_pdf_table(table_rows, col_widths=col_widths))
    story.append(Spacer(1, 0.18 * inch))


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
    overview, trends, distributions = _get_report_export_data(db, date_range=date_range)

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


def export_report_pdf(
    db: Session,
    current_admin: models.User,
    report_type: str,
    date_range: str,
):
    overview, trends, distributions = _get_report_export_data(db, date_range=date_range)

    output = io.BytesIO()
    document = SimpleDocTemplate(
        output,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="ReportTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#2E5895"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ReportMeta",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#4A5568"),
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ReportSection",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#1F2937"),
            spaceBefore=8,
            spaceAfter=6,
        )
    )

    story = []

    report_label = _format_report_type_label(report_type)
    generated_by = f"{current_admin.first_name} {current_admin.last_name}".strip() or current_admin.email

    story.append(Paragraph("BantayKalusugan Admin Report", styles["ReportTitle"]))
    story.append(Paragraph(report_label, styles["ReportMeta"]))
    story.append(Paragraph(f"Report Type: {report_label}", styles["ReportMeta"]))
    story.append(Paragraph(f"Date Range: {date_range}", styles["ReportMeta"]))
    story.append(Paragraph(f"Generated By: {generated_by}", styles["ReportMeta"]))
    story.append(Paragraph(f"Generated On: {date.today().isoformat()}", styles["ReportMeta"]))
    story.append(Spacer(1, 0.2 * inch))

    _append_pdf_section(
        story,
        "Overview Metrics",
        ["Metric", "Value"],
        [
            ["Total Patients", overview["total_patients"]],
            ["BP Records Today", overview["bp_records_today"]],
            ["Total Visits", overview["total_visits"]],
            ["Average Systolic", overview["avg_systolic"]],
            ["Average Diastolic", overview["avg_diastolic"]],
            ["Reports Generated", overview["reports_generated"]],
        ],
        styles["ReportSection"],
        col_widths=[2.2 * inch, 4.6 * inch],
    )

    _append_pdf_section(
        story,
        "Monthly Summary",
        ["Month", "Patients", "Visits", "Average Systolic BP"],
        [
            [point["month"], point["patients"], point["visits"], point["avg_bp"]]
            for point in trends["monthly_summary"]
        ],
        styles["ReportSection"],
        col_widths=[1.2 * inch, 1.0 * inch, 1.0 * inch, 2.7 * inch],
    )

    _append_pdf_section(
        story,
        "Blood Pressure Trends",
        ["Month", "Avg Systolic", "Avg Diastolic"],
        [[point["month"], point["systolic"], point["diastolic"]] for point in trends["bp_trends"]],
        styles["ReportSection"],
        col_widths=[2.0 * inch, 2.0 * inch, 2.0 * inch],
    )

    _append_pdf_section(
        story,
        "Registration Trends",
        ["Month", "New Patients"],
        [[point["month"], point["patients"]] for point in trends["registrations"]],
        styles["ReportSection"],
        col_widths=[3.0 * inch, 3.0 * inch],
    )

    _append_pdf_section(
        story,
        "Health Condition Distribution",
        ["Condition", "Count"],
        [[point["name"], point["value"]] for point in distributions["health_conditions"]],
        styles["ReportSection"],
        col_widths=[3.0 * inch, 3.0 * inch],
    )

    _append_pdf_section(
        story,
        "Age Distribution",
        ["Age Range", "Count"],
        [[point["range"], point["count"]] for point in distributions["age_distribution"]],
        styles["ReportSection"],
        col_widths=[3.0 * inch, 3.0 * inch],
    )

    document.build(story)

    create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="Added",
        target_id=current_admin.id,
        target_type="Report",
        details=f"Exported {report_type} report for {date_range} as PDF",
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


def _change_user_password(
    db: Session,
    current_user: models.User,
    password_data: schemas.PasswordChangeRequest,
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise PermissionError("Current password is incorrect")

    if password_data.new_password != password_data.confirm_password:
        raise ValueError("New password and confirm password do not match")

    if password_data.new_password == password_data.current_password:
        raise ValueError("New password must be different from current password")

    strength_error = _validate_password_strength(password_data.new_password)
    if strength_error:
        raise ValueError(strength_error)

    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()


def change_user_password(
    db: Session,
    current_user: models.User,
    password_data: schemas.PasswordChangeRequest,
):
    _change_user_password(db, current_user, password_data)


def change_admin_password(
    db: Session,
    current_admin: models.User,
    password_data: schemas.PasswordChangeRequest,
):
    _change_user_password(db, current_admin, password_data)

    create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="Updated",
        target_id=current_admin.id,
        target_type="Settings",
        details="Changed account password",
    )


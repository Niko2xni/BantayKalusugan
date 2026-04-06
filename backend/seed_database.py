"""Seed the BantayKalusugan database with deterministic demo data.

Run from the backend folder:
    python seed_database.py
    python seed_database.py --count 3
    python seed_database.py --reset
    python seed_database.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections import Counter
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import models
from app.database import SessionLocal, engine
from app.security import get_password_hash


models.Base.metadata.create_all(bind=engine)

SEED_MARKER = "[seed]"
DEFAULT_ADMIN_PASSWORD = "AdminSeed123!"
DEFAULT_PATIENT_PASSWORD = "PatientSeed123!"
BASE_TIMESTAMP = datetime(2026, 4, 7, 8, 0, tzinfo=UTC)

BARANGAY_SETTINGS_KEY = "barangay_info"
SYSTEM_SETTINGS_KEY = "system_preferences"


@dataclass(frozen=True)
class UserSeed:
    first_name: str
    last_name: str
    email: str
    phone: str
    date_of_birth: date
    sex: str
    address: str
    barangay: str
    role: str
    password: str
    created_at: datetime


@dataclass(frozen=True)
class VitalSeed:
    timestamp: datetime
    systolic: int
    diastolic: int
    heart_rate: int
    temperature: float
    spo2: int
    respiratory_rate: int
    weight: float
    height: float
    recorded_by: str = "Seed Clinic Staff"


@dataclass(frozen=True)
class AppointmentSeed:
    appointment_type: str
    health_area: str
    scheduled_at: datetime
    status: str
    location: str
    assigned_staff: str
    notes: str
    requested_notes: str
    created_at: datetime


@dataclass(frozen=True)
class NotificationSeed:
    title: str
    body: str
    kind: str
    is_read: bool
    created_at: datetime
    read_at: datetime | None = None


@dataclass(frozen=True)
class MessageSeed:
    sender_type: str
    message: str
    channel: str
    created_at: datetime


@dataclass(frozen=True)
class PatientProfileSeed:
    user: UserSeed
    vitals: tuple[VitalSeed, ...]
    appointments: tuple[AppointmentSeed, ...]
    notifications: tuple[NotificationSeed, ...]
    messages: tuple[MessageSeed, ...]


@dataclass(frozen=True)
class AdminSettingSeed:
    key: str
    value: dict
    updated_at: datetime


ADMIN_SEEDS = (
    UserSeed(
        first_name="Aida",
        last_name="Reyes",
        email="seed.admin.reyes@bantaykalusugan.com",
        phone="09170000001",
        date_of_birth=date(1980, 2, 14),
        sex="Female",
        address="Barangay Health Center Office",
        barangay="Barangay San Isidro",
        role="admin",
        password=DEFAULT_ADMIN_PASSWORD,
        created_at=BASE_TIMESTAMP - timedelta(days=30),
    ),
    UserSeed(
        first_name="Marco",
        last_name="Santos",
        email="seed.admin.santos@bantaykalusugan.com",
        phone="09170000002",
        date_of_birth=date(1978, 11, 3),
        sex="Male",
        address="Barangay Hall Annex",
        barangay="Barangay San Isidro",
        role="admin",
        password=DEFAULT_ADMIN_PASSWORD,
        created_at=BASE_TIMESTAMP - timedelta(days=29),
    ),
)

PATIENT_PROFILES = (
    PatientProfileSeed(
        user=UserSeed(
            first_name="Juan",
            last_name="Dela Cruz",
            email="seed.patient.juan@example.com",
            phone="09170001001",
            date_of_birth=date(1994, 6, 1),
            sex="Male",
            address="Zone 4, Barangay 3",
            barangay="Barangay 3",
            role="patient",
            password=DEFAULT_PATIENT_PASSWORD,
            created_at=BASE_TIMESTAMP - timedelta(days=21),
        ),
        vitals=(
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=18, hours=1),
                systolic=128,
                diastolic=82,
                heart_rate=76,
                temperature=36.6,
                spo2=98,
                respiratory_rate=16,
                weight=64.2,
                height=165.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=10, hours=1, minutes=30),
                systolic=134,
                diastolic=86,
                heart_rate=80,
                temperature=36.8,
                spo2=97,
                respiratory_rate=17,
                weight=64.0,
                height=165.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=2, hours=1),
                systolic=142,
                diastolic=92,
                heart_rate=88,
                temperature=37.1,
                spo2=95,
                respiratory_rate=18,
                weight=64.5,
                height=165.0,
            ),
        ),
        appointments=(
            AppointmentSeed(
                appointment_type="General Consultation",
                health_area="General",
                scheduled_at=BASE_TIMESTAMP + timedelta(days=3, hours=1),
                status="Pending",
                location="Barangay Health Center",
                assigned_staff="Pending Assignment",
                notes="Bring latest BP log",
                requested_notes="Needs follow-up on elevated readings",
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=1),
            ),
            AppointmentSeed(
                appointment_type="Follow-up",
                health_area="General",
                scheduled_at=BASE_TIMESTAMP + timedelta(days=10, hours=2, minutes=30),
                status="Confirmed",
                location="Barangay Health Center",
                assigned_staff="Admin Reyes",
                notes="Bring medication list",
                requested_notes="Blood pressure review",
                created_at=BASE_TIMESTAMP - timedelta(days=2, hours=2),
            ),
        ),
        notifications=(
            NotificationSeed(
                title="Appointment requested",
                body="Your request for General Consultation on 2026-04-10 09:00 UTC was submitted.",
                kind="appointment",
                is_read=False,
                created_at=BASE_TIMESTAMP - timedelta(days=1),
            ),
            NotificationSeed(
                title="Support response available",
                body="A new support reply has been added to your chat.",
                kind="chat",
                is_read=True,
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=2),
                read_at=BASE_TIMESTAMP - timedelta(days=1, hours=1, minutes=40),
            ),
        ),
        messages=(
            MessageSeed(
                sender_type="patient",
                message="Hello, I need help with my appointment schedule.",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=3),
            ),
            MessageSeed(
                sender_type="bot",
                message="Use the Schedules page to request, cancel, or reschedule appointments.",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=2, minutes=58),
            ),
            MessageSeed(
                sender_type="patient",
                message="Can I move it to next week?",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=2, minutes=50),
            ),
            MessageSeed(
                sender_type="bot",
                message="Open the appointment card and choose Reschedule.",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=2, minutes=48),
            ),
        ),
    ),
    PatientProfileSeed(
        user=UserSeed(
            first_name="Maria",
            last_name="Santos",
            email="seed.patient.maria@example.com",
            phone="09170001002",
            date_of_birth=date(1991, 9, 12),
            sex="Female",
            address="Zone 2, Barangay 4",
            barangay="Barangay 4",
            role="patient",
            password=DEFAULT_PATIENT_PASSWORD,
            created_at=BASE_TIMESTAMP - timedelta(days=20),
        ),
        vitals=(
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=17, hours=1),
                systolic=120,
                diastolic=78,
                heart_rate=72,
                temperature=36.4,
                spo2=99,
                respiratory_rate=15,
                weight=58.4,
                height=160.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=9, hours=1, minutes=30),
                systolic=124,
                diastolic=80,
                heart_rate=74,
                temperature=36.7,
                spo2=98,
                respiratory_rate=16,
                weight=58.7,
                height=160.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=1, hours=1),
                systolic=126,
                diastolic=81,
                heart_rate=76,
                temperature=36.8,
                spo2=98,
                respiratory_rate=16,
                weight=58.9,
                height=160.0,
            ),
        ),
        appointments=(
            AppointmentSeed(
                appointment_type="Dental Checkup",
                health_area="Dental",
                scheduled_at=BASE_TIMESTAMP - timedelta(days=4, hours=2),
                status="Completed",
                location="Barangay Dental Unit",
                assigned_staff="Admin Santos",
                notes="Teeth cleaning completed",
                requested_notes="Routine dental cleaning",
                created_at=BASE_TIMESTAMP - timedelta(days=12, hours=1),
            ),
            AppointmentSeed(
                appointment_type="Immunization",
                health_area="Immunization",
                scheduled_at=BASE_TIMESTAMP + timedelta(days=8, hours=3),
                status="Pending",
                location="Barangay Health Center",
                assigned_staff="Pending Assignment",
                notes="Bring vaccination card",
                requested_notes="Child immunization follow-up",
                created_at=BASE_TIMESTAMP - timedelta(days=3, hours=1),
            ),
        ),
        notifications=(
            NotificationSeed(
                title="Dental visit completed",
                body="Your dental checkup was recorded successfully.",
                kind="appointment",
                is_read=True,
                created_at=BASE_TIMESTAMP - timedelta(days=4),
                read_at=BASE_TIMESTAMP - timedelta(days=4, hours=1),
            ),
            NotificationSeed(
                title="Immunization reminder",
                body="Your next immunization appointment is coming soon.",
                kind="appointment",
                is_read=False,
                created_at=BASE_TIMESTAMP - timedelta(days=2),
            ),
        ),
        messages=(
            MessageSeed(
                sender_type="patient",
                message="Can I get a copy of my latest records?",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=2, hours=4),
            ),
            MessageSeed(
                sender_type="bot",
                message="Open Analytics to review your current vitals and export the CSV report.",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=2, hours=3, minutes=58),
            ),
        ),
    ),
    PatientProfileSeed(
        user=UserSeed(
            first_name="Liza",
            last_name="Garcia",
            email="seed.patient.liza@example.com",
            phone="09170001003",
            date_of_birth=date(1988, 3, 24),
            sex="Female",
            address="Zone 7, Barangay 5",
            barangay="Barangay 5",
            role="patient",
            password=DEFAULT_PATIENT_PASSWORD,
            created_at=BASE_TIMESTAMP - timedelta(days=19),
        ),
        vitals=(
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=16, hours=1),
                systolic=112,
                diastolic=72,
                heart_rate=68,
                temperature=36.3,
                spo2=99,
                respiratory_rate=14,
                weight=52.5,
                height=158.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=8, hours=1, minutes=30),
                systolic=118,
                diastolic=76,
                heart_rate=70,
                temperature=36.5,
                spo2=99,
                respiratory_rate=15,
                weight=52.7,
                height=158.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=1, hours=2),
                systolic=121,
                diastolic=79,
                heart_rate=71,
                temperature=36.6,
                spo2=98,
                respiratory_rate=15,
                weight=52.6,
                height=158.0,
            ),
        ),
        appointments=(
            AppointmentSeed(
                appointment_type="Family Planning Consultation",
                health_area="Family Planning",
                scheduled_at=BASE_TIMESTAMP + timedelta(days=4, hours=2),
                status="Confirmed",
                location="Barangay Health Center",
                assigned_staff="Admin Reyes",
                notes="Private consultation room",
                requested_notes="Discuss family planning options",
                created_at=BASE_TIMESTAMP - timedelta(days=5, hours=1),
            ),
            AppointmentSeed(
                appointment_type="General Consultation",
                health_area="General",
                scheduled_at=BASE_TIMESTAMP - timedelta(days=6, hours=1),
                status="Completed",
                location="Barangay Health Center",
                assigned_staff="Admin Santos",
                notes="Routine checkup completed",
                requested_notes="Annual physical",
                created_at=BASE_TIMESTAMP - timedelta(days=14, hours=1),
            ),
        ),
        notifications=(
            NotificationSeed(
                title="Consultation confirmed",
                body="Your family planning consultation was confirmed for next week.",
                kind="appointment",
                is_read=False,
                created_at=BASE_TIMESTAMP - timedelta(days=3),
            ),
            NotificationSeed(
                title="Chat reply received",
                body="A support reply has been added to your conversation.",
                kind="chat",
                is_read=True,
                created_at=BASE_TIMESTAMP - timedelta(days=3, hours=1),
                read_at=BASE_TIMESTAMP - timedelta(days=3, hours=1, minutes=20),
            ),
        ),
        messages=(
            MessageSeed(
                sender_type="patient",
                message="Hi, I want to ask about my appointment options.",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=3, hours=4),
            ),
            MessageSeed(
                sender_type="bot",
                message="Schedules lets you request, cancel, and reschedule your appointments.",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=3, hours=3, minutes=58),
            ),
        ),
    ),
    PatientProfileSeed(
        user=UserSeed(
            first_name="Noel",
            last_name="Dizon",
            email="seed.patient.noel@example.com",
            phone="09170001004",
            date_of_birth=date(1984, 12, 8),
            sex="Male",
            address="Zone 5, Barangay 6",
            barangay="Barangay 6",
            role="patient",
            password=DEFAULT_PATIENT_PASSWORD,
            created_at=BASE_TIMESTAMP - timedelta(days=18),
        ),
        vitals=(
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=15, hours=1),
                systolic=136,
                diastolic=88,
                heart_rate=82,
                temperature=36.9,
                spo2=97,
                respiratory_rate=17,
                weight=71.2,
                height=170.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=7, hours=1, minutes=30),
                systolic=140,
                diastolic=90,
                heart_rate=84,
                temperature=37.0,
                spo2=96,
                respiratory_rate=18,
                weight=71.4,
                height=170.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=1, hours=1),
                systolic=138,
                diastolic=86,
                heart_rate=83,
                temperature=36.8,
                spo2=96,
                respiratory_rate=17,
                weight=71.1,
                height=170.0,
            ),
        ),
        appointments=(
            AppointmentSeed(
                appointment_type="TB Follow-up",
                health_area="TB",
                scheduled_at=BASE_TIMESTAMP + timedelta(days=2, hours=1),
                status="Confirmed",
                location="Barangay Health Center",
                assigned_staff="Admin Santos",
                notes="Bring TB treatment card",
                requested_notes="Follow-up after medication review",
                created_at=BASE_TIMESTAMP - timedelta(days=4, hours=1),
            ),
            AppointmentSeed(
                appointment_type="General Consultation",
                health_area="General",
                scheduled_at=BASE_TIMESTAMP + timedelta(days=6, hours=2),
                status="Cancelled",
                location="Barangay Health Center",
                assigned_staff="Admin Reyes",
                notes="Cancelled by patient",
                requested_notes="Conflict with work schedule",
                created_at=BASE_TIMESTAMP - timedelta(days=6, hours=1),
            ),
        ),
        notifications=(
            NotificationSeed(
                title="Appointment updated",
                body="Your TB follow-up was confirmed.",
                kind="appointment",
                is_read=False,
                created_at=BASE_TIMESTAMP - timedelta(days=2),
            ),
            NotificationSeed(
                title="Vitals reminder",
                body="Please bring your logbook to the next visit.",
                kind="general",
                is_read=True,
                created_at=BASE_TIMESTAMP - timedelta(days=2, hours=1),
                read_at=BASE_TIMESTAMP - timedelta(days=2, hours=1, minutes=15),
            ),
        ),
        messages=(
            MessageSeed(
                sender_type="patient",
                message="Do I need to bring anything for the follow-up?",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=2, hours=4),
            ),
            MessageSeed(
                sender_type="bot",
                message="Please bring your treatment card and any recent blood pressure notes.",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=2, hours=3, minutes=56),
            ),
        ),
    ),
    PatientProfileSeed(
        user=UserSeed(
            first_name="Angela",
            last_name="Ramos",
            email="seed.patient.angela@example.com",
            phone="09170001005",
            date_of_birth=date(1997, 1, 30),
            sex="Female",
            address="Zone 3, Barangay 7",
            barangay="Barangay 7",
            role="patient",
            password=DEFAULT_PATIENT_PASSWORD,
            created_at=BASE_TIMESTAMP - timedelta(days=17),
        ),
        vitals=(
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=14, hours=1),
                systolic=122,
                diastolic=80,
                heart_rate=74,
                temperature=36.5,
                spo2=98,
                respiratory_rate=15,
                weight=60.1,
                height=162.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=6, hours=1, minutes=30),
                systolic=130,
                diastolic=84,
                heart_rate=77,
                temperature=36.7,
                spo2=98,
                respiratory_rate=16,
                weight=60.0,
                height=162.0,
            ),
            VitalSeed(
                timestamp=BASE_TIMESTAMP - timedelta(days=1, hours=2),
                systolic=128,
                diastolic=82,
                heart_rate=75,
                temperature=36.6,
                spo2=97,
                respiratory_rate=16,
                weight=59.8,
                height=162.0,
            ),
        ),
        appointments=(
            AppointmentSeed(
                appointment_type="Check-up",
                health_area="General",
                scheduled_at=BASE_TIMESTAMP + timedelta(days=1, hours=2),
                status="Confirmed",
                location="Barangay Health Center",
                assigned_staff="Admin Reyes",
                notes="Routine blood pressure check",
                requested_notes="Monthly check-up",
                created_at=BASE_TIMESTAMP - timedelta(days=3, hours=2),
            ),
            AppointmentSeed(
                appointment_type="Follow-up",
                health_area="General",
                scheduled_at=BASE_TIMESTAMP + timedelta(days=7, hours=2),
                status="Pending",
                location="Barangay Health Center",
                assigned_staff="Pending Assignment",
                notes="Awaiting schedule confirmation",
                requested_notes="Review recent readings",
                created_at=BASE_TIMESTAMP - timedelta(days=2, hours=1),
            ),
        ),
        notifications=(
            NotificationSeed(
                title="Check-up confirmed",
                body="Your routine check-up was confirmed for tomorrow.",
                kind="appointment",
                is_read=False,
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=4),
            ),
            NotificationSeed(
                title="Support response available",
                body="Your chat thread has a new support reply.",
                kind="chat",
                is_read=True,
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=3),
                read_at=BASE_TIMESTAMP - timedelta(days=1, hours=2, minutes=45),
            ),
        ),
        messages=(
            MessageSeed(
                sender_type="patient",
                message="Hello, can I confirm my next check-up date?",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=5),
            ),
            MessageSeed(
                sender_type="bot",
                message="Your schedules page shows the latest confirmed appointments.",
                channel="support",
                created_at=BASE_TIMESTAMP - timedelta(days=1, hours=4, minutes=58),
            ),
        ),
    ),
)

ADMIN_SETTING_SEEDS = (
    AdminSettingSeed(
        key=BARANGAY_SETTINGS_KEY,
        value={
            "name": "Barangay San Antonio",
            "municipality": "Quezon City",
            "province": "Metro Manila",
            "address": "123 Barangay Hall Road, San Antonio, Quezon City",
            "contact_number": "+63 2 1234 5678",
        },
        updated_at=BASE_TIMESTAMP - timedelta(days=7),
    ),
    AdminSettingSeed(
        key=SYSTEM_SETTINGS_KEY,
        value={
            "language": "en",
            "timezone": "Asia/Manila",
            "date_format": "MM/DD/YYYY",
            "notifications": True,
            "email_alerts": True,
            "auto_backup": True,
        },
        updated_at=BASE_TIMESTAMP - timedelta(days=7, minutes=10),
    ),
)


def ts(days: int = 0, hours: int = 0, minutes: int = 0) -> datetime:
    return BASE_TIMESTAMP + timedelta(days=days, hours=hours, minutes=minutes)


def seed_date(timestamp: datetime) -> str:
    return timestamp.date().isoformat()


def seed_time(timestamp: datetime) -> str:
    return timestamp.strftime("%H:%M")


def get_user_by_email_or_phone(db, email: str, phone: str):
    return (
        db.query(models.User)
        .filter((models.User.email == email) | (models.User.phone == phone))
        .first()
    )


def get_setting_by_key(db, key: str):
    return db.query(models.AdminSetting).filter(models.AdminSetting.key == key).first()


def get_vital_by_seed(db, patient_id: int, seed: VitalSeed):
    return (
        db.query(models.VitalSign)
        .filter(
            models.VitalSign.patient_id == patient_id,
            models.VitalSign.date == seed_date(seed.timestamp),
            models.VitalSign.time == seed_time(seed.timestamp),
            models.VitalSign.systolic == seed.systolic,
            models.VitalSign.diastolic == seed.diastolic,
        )
        .first()
    )


def get_appointment_by_seed(db, patient_id: int, seed: AppointmentSeed):
    return (
        db.query(models.Appointment)
        .filter(
            models.Appointment.patient_id == patient_id,
            models.Appointment.appointment_type == seed.appointment_type,
            models.Appointment.scheduled_at == seed.scheduled_at,
        )
        .first()
    )


def get_notification_by_seed(db, user_id: int, seed: NotificationSeed):
    return (
        db.query(models.Notification)
        .filter(
            models.Notification.user_id == user_id,
            models.Notification.title == seed.title,
            models.Notification.body == seed.body,
            models.Notification.kind == seed.kind,
        )
        .first()
    )


def get_message_by_seed(db, user_id: int, seed: MessageSeed):
    return (
        db.query(models.ChatMessage)
        .filter(
            models.ChatMessage.user_id == user_id,
            models.ChatMessage.channel == seed.channel,
            models.ChatMessage.sender_type == seed.sender_type,
            models.ChatMessage.message == seed.message,
        )
        .first()
    )


def get_audit_log_by_seed(db, admin_id: int, action: str, target_id: int, target_type: str, details: str):
    return (
        db.query(models.AuditLog)
        .filter(
            models.AuditLog.admin_id == admin_id,
            models.AuditLog.action == action,
            models.AuditLog.target_id == target_id,
            models.AuditLog.target_type == target_type,
            models.AuditLog.details == details,
        )
        .first()
    )


def seed_user(db, seed: UserSeed, dry_run: bool, stats: Counter):
    existing = get_user_by_email_or_phone(db, seed.email, seed.phone)
    counter_prefix = "admin_users" if seed.role == "admin" else "patient_users"

    if existing is not None:
        stats[f"{counter_prefix}_skipped"] += 1
        return existing

    stats[f"{counter_prefix}_created"] += 1
    if dry_run:
        return None

    user = models.User(
        first_name=seed.first_name,
        last_name=seed.last_name,
        email=seed.email,
        phone=seed.phone,
        date_of_birth=seed.date_of_birth,
        sex=seed.sex,
        address=seed.address,
        barangay=seed.barangay,
        hashed_password=get_password_hash(seed.password),
        role=seed.role,
        is_active=True,
        created_at=seed.created_at,
        updated_at=seed.created_at,
    )
    db.add(user)
    db.flush()
    return user


def seed_setting(db, seed: AdminSettingSeed, dry_run: bool, stats: Counter):
    existing = get_setting_by_key(db, seed.key)
    if existing is not None:
        stats["settings_skipped"] += 1
        return existing

    stats["settings_created"] += 1
    if dry_run:
        return None

    setting = models.AdminSetting(
        key=seed.key,
        value=json.dumps(seed.value, sort_keys=True),
        updated_at=seed.updated_at,
    )
    db.add(setting)
    db.flush()
    return setting


def seed_vital(db, patient: models.User, seed: VitalSeed, dry_run: bool, stats: Counter):
    existing = get_vital_by_seed(db, patient.id, seed)
    if existing is not None:
        stats["vitals_skipped"] += 1
        return existing

    stats["vitals_created"] += 1
    if dry_run:
        return None

    vital = models.VitalSign(
        patient_id=patient.id,
        date=seed_date(seed.timestamp),
        time=seed_time(seed.timestamp),
        systolic=seed.systolic,
        diastolic=seed.diastolic,
        heart_rate=seed.heart_rate,
        temperature=seed.temperature,
        spo2=seed.spo2,
        respiratory_rate=seed.respiratory_rate,
        weight=seed.weight,
        height=seed.height,
        recorded_by=seed.recorded_by,
        created_at=seed.timestamp,
    )
    db.add(vital)
    db.flush()
    return vital


def seed_appointment(db, patient: models.User, seed: AppointmentSeed, dry_run: bool, stats: Counter):
    existing = get_appointment_by_seed(db, patient.id, seed)
    if existing is not None:
        stats["appointments_skipped"] += 1
        return existing

    stats["appointments_created"] += 1
    if dry_run:
        return None

    appointment = models.Appointment(
        patient_id=patient.id,
        appointment_type=seed.appointment_type,
        health_area=seed.health_area,
        scheduled_at=seed.scheduled_at,
        status=seed.status,
        location=seed.location,
        assigned_staff=seed.assigned_staff,
        notes=seed.notes,
        requested_notes=seed.requested_notes,
        created_at=seed.created_at,
    )
    db.add(appointment)
    db.flush()
    return appointment


def seed_notification(db, patient: models.User, seed: NotificationSeed, dry_run: bool, stats: Counter):
    existing = get_notification_by_seed(db, patient.id, seed)
    if existing is not None:
        stats["notifications_skipped"] += 1
        return existing

    stats["notifications_created"] += 1
    if dry_run:
        return None

    notification = models.Notification(
        user_id=patient.id,
        title=seed.title,
        body=seed.body,
        kind=seed.kind,
        is_read=seed.is_read,
        created_at=seed.created_at,
        read_at=seed.read_at,
    )
    db.add(notification)
    db.flush()
    return notification


def seed_message(db, patient: models.User, seed: MessageSeed, dry_run: bool, stats: Counter):
    existing = get_message_by_seed(db, patient.id, seed)
    if existing is not None:
        stats["messages_skipped"] += 1
        return existing

    stats["messages_created"] += 1
    if dry_run:
        return None

    message = models.ChatMessage(
        user_id=patient.id,
        sender_type=seed.sender_type,
        message=seed.message,
        channel=seed.channel,
        created_at=seed.created_at,
    )
    db.add(message)
    db.flush()
    return message


def seed_audit_log(db, admin: models.User, target: models.User | models.VitalSign | models.Appointment | models.AdminSetting, action: str, target_type: str, details: str, dry_run: bool, stats: Counter):
    existing = get_audit_log_by_seed(db, admin.id, action, target.id, target_type, details)
    if existing is not None:
        stats["audit_logs_skipped"] += 1
        return existing

    stats["audit_logs_created"] += 1
    if dry_run:
        return None

    audit_log = models.AuditLog(
        admin_id=admin.id,
        action=action,
        target_id=target.id,
        target_type=target_type,
        details=details,
        timestamp=BASE_TIMESTAMP,
    )
    db.add(audit_log)
    db.flush()
    return audit_log


def reset_seed_data(db, stats: Counter):
    seed_emails = {seed.email for seed in ADMIN_SEEDS}
    seed_emails.update(profile.user.email for profile in PATIENT_PROFILES)

    seed_users = (
        db.query(models.User)
        .filter(models.User.email.in_(seed_emails))
        .all()
    )
    seed_user_ids = [user.id for user in seed_users]
    seed_patient_ids = [user.id for user in seed_users if user.role == "patient"]

    if seed_user_ids:
        seed_audit_log_ids = [
            log.id
            for log in db.query(models.AuditLog)
            .filter(models.AuditLog.details.startswith(f"{SEED_MARKER} "))
            .all()
        ]
        if seed_audit_log_ids:
            db.query(models.AuditLog).filter(models.AuditLog.id.in_(seed_audit_log_ids)).delete(synchronize_session=False)
            stats["audit_logs_deleted"] += len(seed_audit_log_ids)

        db.query(models.ChatMessage).filter(models.ChatMessage.user_id.in_(seed_user_ids)).delete(synchronize_session=False)
        db.query(models.Notification).filter(models.Notification.user_id.in_(seed_user_ids)).delete(synchronize_session=False)
        if seed_patient_ids:
            db.query(models.Appointment).filter(models.Appointment.patient_id.in_(seed_patient_ids)).delete(synchronize_session=False)
            db.query(models.VitalSign).filter(models.VitalSign.patient_id.in_(seed_patient_ids)).delete(synchronize_session=False)

        deleted_users = db.query(models.User).filter(models.User.id.in_(seed_user_ids)).delete(synchronize_session=False)
        stats["users_deleted"] += deleted_users

    setting_keys = [seed.key for seed in ADMIN_SETTING_SEEDS]
    deleted_settings = (
        db.query(models.AdminSetting)
        .filter(models.AdminSetting.key.in_(setting_keys))
        .delete(synchronize_session=False)
    )
    stats["settings_deleted"] += deleted_settings

    db.commit()


def seed_patient_profile(db, profile: PatientProfileSeed, dry_run: bool, stats: Counter):
    patient = seed_user(db, profile.user, dry_run=dry_run, stats=stats)

    if patient is None and dry_run:
        stats["vitals_created"] += len(profile.vitals)
        stats["appointments_created"] += len(profile.appointments)
        stats["notifications_created"] += len(profile.notifications)
        stats["messages_created"] += len(profile.messages)
        return None

    vital_objects = []
    appointment_objects = []
    notification_objects = []
    message_objects = []

    for vital_seed in profile.vitals:
        vital = seed_vital(db, patient, vital_seed, dry_run=dry_run, stats=stats)
        if vital is not None:
            vital_objects.append(vital)

    for appointment_seed in profile.appointments:
        appointment = seed_appointment(db, patient, appointment_seed, dry_run=dry_run, stats=stats)
        if appointment is not None:
            appointment_objects.append(appointment)

    for notification_seed in profile.notifications:
        notification = seed_notification(db, patient, notification_seed, dry_run=dry_run, stats=stats)
        if notification is not None:
            notification_objects.append(notification)

    for message_seed in profile.messages:
        message = seed_message(db, patient, message_seed, dry_run=dry_run, stats=stats)
        if message is not None:
            message_objects.append(message)

    return {
        "patient": patient,
        "vitals": vital_objects,
        "appointments": appointment_objects,
        "notifications": notification_objects,
        "messages": message_objects,
    }


def seed_demo_data(db, patient_count: int | None, dry_run: bool, reset: bool):
    stats = Counter()

    if reset:
        if dry_run:
            print("[seed] Dry run requested with reset. No rows will be deleted or inserted.")
        else:
            print("[seed] Resetting seed-owned rows before reseeding.")
            reset_seed_data(db, stats)

    selected_patient_profiles = PATIENT_PROFILES
    if patient_count is not None:
        selected_patient_profiles = PATIENT_PROFILES[: max(0, min(patient_count, len(PATIENT_PROFILES)))]

    seeded_admins = []
    for admin_seed in ADMIN_SEEDS:
        admin = seed_user(db, admin_seed, dry_run=dry_run, stats=stats)
        if admin is not None:
            seeded_admins.append(admin)

    seeded_patient_results = []
    for profile in selected_patient_profiles:
        result = seed_patient_profile(db, profile, dry_run=dry_run, stats=stats)
        if result is not None:
            seeded_patient_results.append(result)

    for setting_seed in ADMIN_SETTING_SEEDS:
        seed_setting(db, setting_seed, dry_run=dry_run, stats=stats)

    if dry_run and selected_patient_profiles:
        stats["audit_logs_created"] += 3

    first_admin = seeded_admins[0] if seeded_admins else None
    first_patient = seeded_patient_results[0]["patient"] if seeded_patient_results else None
    first_vital = None
    for result in seeded_patient_results:
        if result["vitals"]:
            first_vital = result["vitals"][0]
            break

    if first_admin is not None and first_patient is not None and first_vital is not None:
        seed_audit_log(
            db,
            admin=first_admin,
            target=first_patient,
            action="Added",
            target_type="Patient Record",
            details=f"{SEED_MARKER} seeded demo patient profiles",
            dry_run=dry_run,
            stats=stats,
        )
        seed_audit_log(
            db,
            admin=first_admin,
            target=first_vital,
            action="Added",
            target_type="Vital Signs",
            details=f"{SEED_MARKER} seeded demo vital sign history",
            dry_run=dry_run,
            stats=stats,
        )
        seed_audit_log(
            db,
            admin=first_admin,
            target=first_admin,
            action="Updated",
            target_type="Settings",
            details=f"{SEED_MARKER} initialized demo admin settings",
            dry_run=dry_run,
            stats=stats,
        )

    if not dry_run:
        db.commit()

    return stats, selected_patient_profiles, seeded_admins


def print_summary(stats: Counter, selected_patient_profiles: tuple[PatientProfileSeed, ...], seeded_admins: list[models.User], dry_run: bool):
    heading = "Dry run complete" if dry_run else "Seed complete"
    print(f"\n{heading}")
    print("- Admin users: created {0}, skipped {1}".format(stats["admin_users_created"], stats["admin_users_skipped"]))
    print("- Patient users: created {0}, skipped {1}".format(stats["patient_users_created"], stats["patient_users_skipped"]))
    print("- Vitals: created {0}, skipped {1}".format(stats["vitals_created"], stats["vitals_skipped"]))
    print("- Appointments: created {0}, skipped {1}".format(stats["appointments_created"], stats["appointments_skipped"]))
    print("- Notifications: created {0}, skipped {1}".format(stats["notifications_created"], stats["notifications_skipped"]))
    print("- Chat messages: created {0}, skipped {1}".format(stats["messages_created"], stats["messages_skipped"]))
    print("- Admin settings: created {0}, skipped {1}".format(stats["settings_created"], stats["settings_skipped"]))
    print("- Audit logs: created {0}, skipped {1}".format(stats["audit_logs_created"], stats["audit_logs_skipped"]))

    if not dry_run:
        print("\nSeeded admin login credentials:")
        for admin in seeded_admins:
            print(f"- {admin.email} / {DEFAULT_ADMIN_PASSWORD}")
        print(f"\nSeeded patient accounts use the shared password: {DEFAULT_PATIENT_PASSWORD}")
        print(f"Seeded patient profiles: {len(selected_patient_profiles)}")


def parse_args():
    parser = argparse.ArgumentParser(description="Populate the BantayKalusugan database with demo data.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Remove seed-owned rows before inserting demo data.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be seeded without writing to the database.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=None,
        help="Seed only the first N patient profiles (admins are always seeded).",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    db = SessionLocal()

    try:
        stats, selected_patient_profiles, seeded_admins = seed_demo_data(
            db,
            patient_count=args.count,
            dry_run=args.dry_run,
            reset=args.reset,
        )
        print_summary(stats, selected_patient_profiles, seeded_admins, dry_run=args.dry_run)
    except Exception as exc:
        db.rollback()
        raise SystemExit(f"Seed script failed: {exc}") from exc
    finally:
        db.close()


if __name__ == "__main__":
    main()

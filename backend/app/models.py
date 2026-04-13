from sqlalchemy import Boolean, Column, Integer, String, Date, DateTime, Float, ForeignKey, Text
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information (matches register.jsx form fields)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    sex = Column(String, nullable=False)           # "Male" or "Female"
    address = Column(String, nullable=False)
    barangay = Column(String, nullable=False)

    # Authentication
    hashed_password = Column(String, nullable=False)

    # Role-Based Access Control
    role = Column(String, default="patient", nullable=False)  # "patient" or "admin"

    # Account Status
    is_active = Column(Boolean, default=True)      # Users are active immediately upon registration
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class VitalSign(Base):
    __tablename__ = "vital_signs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Date and time of recording
    date = Column(String, nullable=False)           # "YYYY-MM-DD"
    time = Column(String, nullable=False)           # "HH:MM"

    # Vital sign measurements
    systolic = Column(Integer, nullable=False)
    diastolic = Column(Integer, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    temperature = Column(Float, nullable=False)
    spo2 = Column(Integer, default=0)
    respiratory_rate = Column(Integer, default=0)
    weight = Column(Float, default=0)
    height = Column(Float, default=0)

    # Who recorded the vital signs
    recorded_by = Column(String, default="Admin Staff")

    # OCR paper trail — URL of the scanned source document (nullable)
    source_document_url = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PatientVitalSubmission(Base):
    __tablename__ = "patient_vital_submissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    systolic = Column(Integer, nullable=False)
    diastolic = Column(Integer, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    temperature = Column(Float, nullable=False)
    spo2 = Column(Integer, default=0)
    respiratory_rate = Column(Integer, default=0)
    weight = Column(Float, default=0)
    height = Column(Float, default=0)

    source_document_url = Column(String, nullable=True)

    status = Column(String, nullable=False, default="pending", index=True)
    admin_notes = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    action = Column(String, nullable=False)
    target_id = Column(Integer, nullable=False)
    target_type = Column(String, nullable=False)
    details = Column(String, nullable=False)
    source_document_url = Column(String, nullable=True)


class AdminSetting(Base):
    __tablename__ = "admin_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    appointment_type = Column(String, nullable=False)
    health_area = Column(String, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False, default="Pending")
    location = Column(String, nullable=True)
    assigned_staff = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    requested_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    kind = Column(String, nullable=False, default="general")
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    sender_type = Column(String, nullable=False)  # patient, bot, staff
    message = Column(Text, nullable=False)
    channel = Column(String, nullable=False, default="support")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

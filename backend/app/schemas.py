from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

# --- User Schemas ---

# Base schema with fields shared across create and read
class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    date_of_birth: date
    sex: str                          # "Male" or "Female"
    address: str
    barangay: str

# Schema for creating a new user (frontend sends this on register)
class UserCreate(UserBase):
    password: str                     # Plain password (will be hashed before saving)

# Schema for admin creating a new user (admin doesn't set password)
class AdminUserCreate(UserBase):
    pass

# Schema for updating a user
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    address: Optional[str] = None
    barangay: Optional[str] = None


class CurrentUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None


# Schema for reading/returning a user (never includes the password)
class User(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True        # Allows Pydantic to read data from SQLAlchemy ORM models

# --- Login Schemas ---

# Schema for login request (frontend sends this)
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Schema for login response (backend returns this)
class LoginResponse(BaseModel):
    message: str
    user: User
    access_token: str
    token_type: str = "bearer"

# --- VitalSign Schemas ---

class VitalSignBase(BaseModel):
    patient_id: int
    date: str
    time: str
    systolic: int
    diastolic: int
    heart_rate: int
    temperature: float
    spo2: Optional[int] = 0
    respiratory_rate: Optional[int] = 0
    weight: Optional[float] = 0
    height: Optional[float] = 0
    recorded_by: Optional[str] = "Admin Staff"

class VitalSignCreate(VitalSignBase):
    pass

class VitalSign(VitalSignBase):
    id: int
    patient_name: Optional[str] = None   # We'll populate this from the patient's name
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatientAnalyticsOverview(BaseModel):
    total_records: int
    avg_systolic: float
    avg_diastolic: float
    avg_heart_rate: float
    avg_temperature: float
    avg_spo2: float
    avg_respiratory_rate: float
    avg_weight: float
    avg_height: float
    normal_bp_records: int
    elevated_bp_records: int
    abnormal_bp_records: int

# --- Audit Logs Schemas ---

class AuditLogBase(BaseModel):
    action: str
    target_id: int
    target_type: str
    details: str

class AuditLogCreate(AuditLogBase):
    admin_id: int

class AuditLog(AuditLogBase):
    id: int
    admin_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogItem(AuditLog):
    admin_name: Optional[str] = None
    target_name: Optional[str] = None


class PaginatedAuditLogs(BaseModel):
    items: List[AuditLogItem]
    total: int
    page: int
    page_size: int


class BPTrendPoint(BaseModel):
    month: str
    systolic: int
    diastolic: int


class RegistrationTrendPoint(BaseModel):
    month: str
    patients: int


class MonthlySummaryPoint(BaseModel):
    month: str
    patients: int
    visits: int
    avg_bp: int


class ReportOverviewResponse(BaseModel):
    total_patients: int
    bp_records_today: int
    total_visits: int
    avg_systolic: float
    avg_diastolic: float
    reports_generated: int


class ReportTrendsResponse(BaseModel):
    bp_trends: List[BPTrendPoint]
    registrations: List[RegistrationTrendPoint]
    monthly_summary: List[MonthlySummaryPoint]


class ConditionDistributionItem(BaseModel):
    name: str
    value: int


class AgeDistributionItem(BaseModel):
    range: str
    count: int


class ReportDistributionsResponse(BaseModel):
    health_conditions: List[ConditionDistributionItem]
    age_distribution: List[AgeDistributionItem]


class ReportGenerationLogRequest(BaseModel):
    report_type: str
    date_range: str


class AdminProfileSettings(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str


class BarangaySettings(BaseModel):
    name: str
    municipality: str
    province: str
    address: str
    contact_number: str


class SystemSettings(BaseModel):
    language: str
    timezone: str
    date_format: str
    notifications: bool
    email_alerts: bool
    auto_backup: bool


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class MessageResponse(BaseModel):
    message: str


class AppointmentBase(BaseModel):
    appointment_type: str
    health_area: str
    scheduled_at: datetime
    status: str
    location: Optional[str] = None
    assigned_staff: Optional[str] = None
    notes: Optional[str] = None
    requested_notes: Optional[str] = None


class Appointment(AppointmentBase):
    id: int
    patient_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AppointmentRequestCreate(BaseModel):
    appointment_type: str
    health_area: str
    scheduled_at: datetime
    location: Optional[str] = None
    notes: Optional[str] = None


class AppointmentRescheduleRequest(BaseModel):
    scheduled_at: datetime
    notes: Optional[str] = None


class AdminAppointmentStatusUpdate(BaseModel):
    status: str
    assigned_staff: Optional[str] = None
    notes: Optional[str] = None


class NotificationBase(BaseModel):
    title: str
    body: str
    kind: str
    is_read: bool


class Notification(NotificationBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatMessageBase(BaseModel):
    sender_type: str
    message: str
    channel: str


class ChatMessage(ChatMessageBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    message: str
    channel: str = "support"

from pydantic import BaseModel, EmailStr
from typing import Optional
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


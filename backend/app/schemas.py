from pydantic import BaseModel, EmailStr
from typing import Optional

# Base schema with common attributes
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# Schema for creating a new user (requires a password)
class UserCreate(UserBase):
    password: str

# Schema for reading a user (excludes the password)
class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True  # Allows Pydantic to read data from SQLAlchemy ORM models

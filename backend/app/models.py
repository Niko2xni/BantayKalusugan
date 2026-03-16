from sqlalchemy import Boolean, Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information (matches register.jsx form fields)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    sex = Column(String, nullable=False)           # "Male" or "Female"
    address = Column(String, nullable=False)
    barangay = Column(String, nullable=False)

    # Authentication
    hashed_password = Column(String, nullable=False)

    # Account Status
    is_active = Column(Boolean, default=False)     # False by default — admin must approve
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

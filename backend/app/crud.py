from sqlalchemy.orm import Session
from . import models, schemas

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
    # TODO: In production, use a proper password hashing library like passlib
    # e.g., hashed_password = pwd_context.hash(user.password)
    fake_hashed_password = user.password + "_hashed"

    db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        date_of_birth=user.date_of_birth,
        sex=user.sex,
        address=user.address,
        barangay=user.barangay,
        hashed_password=fake_hashed_password,
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
    # TODO: In production, use passlib to verify:
    # e.g., if not pwd_context.verify(password, user.hashed_password): return None
    fake_hashed_password = password + "_hashed"
    if user.hashed_password != fake_hashed_password:
        return None
    return user

# --- Patient queries ---

# Get only patient-role users (for admin dashboard)
def get_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).filter(models.User.role == "patient").offset(skip).limit(limit).all()

# --- VitalSign CRUD ---

def create_vital_sign(db: Session, vital: schemas.VitalSignCreate):
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
    return db_vital

def get_vital_signs(db: Session, skip: int = 0, limit: int = 500):
    return db.query(models.VitalSign).offset(skip).limit(limit).all()

def get_vital_signs_by_patient(db: Session, patient_id: int):
    return db.query(models.VitalSign).filter(models.VitalSign.patient_id == patient_id).all()

def delete_vital_sign(db: Session, vital_id: int):
    vital = db.query(models.VitalSign).filter(models.VitalSign.id == vital_id).first()
    if vital:
        db.delete(vital)
        db.commit()
    return vital


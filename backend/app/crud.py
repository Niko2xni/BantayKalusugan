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

# --- Admin Patient Management ---

def create_user_admin(db: Session, user: schemas.AdminUserCreate, admin_id: int = 1):
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

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate, admin_id: int = 1):
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

def delete_user(db: Session, user_id: int, admin_id: int = 1):
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

def create_vital_sign(db: Session, vital: schemas.VitalSignCreate, admin_id: int = 1):
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

def delete_vital_sign(db: Session, vital_id: int, admin_id: int = 1):
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
from sqlalchemy import func

def get_community_analytics(db: Session):
    # Get total patients
    total_patients = db.query(models.User).filter(models.User.role == "patient").count()

    # Get records from today using string comparison on the date col 'YYYY-MM-DD'
    from datetime import datetime
    today_str = datetime.now().strftime("%Y-%m-%d")
    bp_records_today = db.query(models.VitalSign).filter(models.VitalSign.date == today_str).count()

    # Get community BP averages by month.
    # Note: SQLite `substr` or `strftime` works differently. 
    # For a portable way or if we assume String Date format "YYYY-MM-DD":
    # Let's get all vitals and aggregate in python if DB-level is complex for cross-db compat.
    vitals = db.query(models.VitalSign).all()
    
    monthly_stats = {}
    for v in vitals:
        # v.date is 'YYYY-MM-DD'
        try:
            month = datetime.strptime(v.date, "%Y-%m-%d").strftime("%b")
            if month not in monthly_stats:
                monthly_stats[month] = {'sys_sum': 0, 'dia_sum': 0, 'count': 0}
            monthly_stats[month]['sys_sum'] += v.systolic
            monthly_stats[month]['dia_sum'] += v.diastolic
            monthly_stats[month]['count'] += 1
        except Exception:
            pass

    bp_trends = []
    # Ensure some order, let's just output them as they are or predefined
    months_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for m in months_order:
        if m in monthly_stats:
            stat = monthly_stats[m]
            bp_trends.append({
                "month": m,
                "systolic": int(stat['sys_sum']/stat['count']),
                "diastolic": int(stat['dia_sum']/stat['count'])
            })

    # Registration trends
    patients = db.query(models.User).filter(models.User.role == "patient").all()
    reg_stats = {}
    for p in patients:
        m = p.created_at.strftime("%b") if p.created_at else datetime.now().strftime("%b")
        reg_stats[m] = reg_stats.get(m, 0) + 1

    registrations = []
    for m in months_order:
        if m in reg_stats:
            registrations.append({
                "month": m,
                "patients": reg_stats[m]
            })

    # We also need High Risk / Healthy, but we'll return the base data and let frontend handle it or compute it here.
    return {
        "total_patients": total_patients,
        "bp_records_today": bp_records_today,
        "bp_trends": bp_trends,
        "registrations": registrations
    }


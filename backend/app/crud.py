from sqlalchemy.orm import Session
from . import models, schemas

# Get a user by ID
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# Get a user by email
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# Get multiple users (with skip and limit for pagination)
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# Create a new user
def create_user(db: Session, user: schemas.UserCreate):
    # In a real app, you MUST hash the password here before saving
    # e.g., hashed_password = get_password_hash(user.password)
    # For now, we are just storing it directly (NOT SECURE FOR PRODUCTION)
    fake_hashed_password = user.password + "notreallyhashed" 
    
    db_user = models.User(
        email=user.email, 
        hashed_password=fake_hashed_password,
        full_name=user.full_name
    )
    
    db.add(db_user)      # Add to session
    db.commit()          # Save to database
    db.refresh(db_user)  # Refresh object to get the assigned ID
    
    return db_user

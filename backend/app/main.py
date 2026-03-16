from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import engine, get_db

# Create all database tables (this is a simple way, but Alembic is better for production)
# We will still set up Alembic, but this ensures tables exist for initial testing
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BantayKalusugan API")

# --- CORS Configuration ---
# This is REQUIRED for your React frontend (running on another port) to communicate with this backend.
origins = [
    "http://localhost:5173",  # Default Vite Dev Server port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Routes ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the BantayKalusugan API!"}

@app.post("/api/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Block admin domain from public registration
    if user.email.lower().endswith("@bantaykalusugan.com"):
        raise HTTPException(status_code=400, detail="This email domain is reserved for admin accounts. Please use a different email.")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_phone = crud.get_user_by_phone(db, phone=user.phone)
    if db_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    return crud.create_user(db=db, user=user)

@app.get("/api/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/api/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/api/login/", response_model=schemas.LoginResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return schemas.LoginResponse(message="Login successful", user=user)


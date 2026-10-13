# BantayKalusugan Backend

This folder contains the FastAPI backend used by the BantayKalusugan system.

Hosted website: [bantaykalusugan.onrender.com](https://bantaykalusugan.onrender.com/)

## Prerequisites

- Python 3.11+
- PostgreSQL database (Neon or local)
- PowerShell (commands below use Windows PowerShell format)

## Install and Run (Backend Only)

Run these commands from the repository root:

```powershell
# Optional: if PowerShell blocks virtual environment script execution, run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

python -m venv .venv
.\.venv\Scripts\Activate.ps1
Set-Location .\backend
pip install -r requirements.txt
```

Create your backend environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and configure settings:

```env
# Required for local development:
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET_KEY=dev-secret-key-change-in-production
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Optional:
# AZURE_STORAGE_CONNECTION_STRING=...
# AZURE_STORAGE_CONTAINER_NAME=documents
# AZURE_OCR_ENDPOINT=...
# AZURE_OCR_KEY=...
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=...
```

Run database migrations:

```powershell
alembic upgrade head
```

*(Optional)* Create an initial admin or seed data:

```powershell
# Create admin account (email must end with @bantaykalusugan.com):
..\.venv\Scripts\python.exe create_admin.py

# Seed database with sample patients and vitals:
..\.venv\Scripts\python.exe seed_database.py
```

Start the backend server:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend URLs:

- API root: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

## Run Backend Tests

From the `backend` folder:

```powershell
..\.venv\Scripts\python.exe -m pytest -q tests
```

## Run Full System

For full backend + frontend setup and startup steps, see the root README in `../README.md`.

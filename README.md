# BantayKalusugan

BantayKalusugan is a full-stack health monitoring system with:

- `backend/`: FastAPI + SQLAlchemy + Alembic
- `frontend/`: React + Vite

## Live Website

The hosted frontend is available here: [bantaykalusugan.onrender.com](https://bantaykalusugan.onrender.com/)

## Prerequisites

- Python 3.11+
- Node.js 20+ and npm 10+
- PostgreSQL database (Neon or local)
- Windows PowerShell (commands below use PowerShell format)

## 1. Clone and Open the Project

```powershell
Set-Location "<your-projects-folder>"
git clone <your-repo-url>
Set-Location .\BantayKalusugan
```

## 2. Backend Setup

```powershell
# Optional: if PowerShell blocks virtual environment script execution, run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

python -m venv .venv
.\.venv\Scripts\Activate.ps1
Set-Location .\backend
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `backend/.env` with your settings:

```env
# Required: PostgreSQL connection string (e.g. from Neon or local Postgres)
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require

# Required: Secret key for JWT authentication
JWT_SECRET_KEY=dev-secret-key-change-in-production

# Required: Allowed frontend origin(s) for CORS
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Optional: Azure Document Intelligence (OCR) & Azure Blob Storage
# (Only needed if testing paper trail document uploads and OCR)
# AZURE_STORAGE_CONNECTION_STRING=...
# AZURE_STORAGE_CONTAINER_NAME=documents
# AZURE_OCR_ENDPOINT=...
# AZURE_OCR_KEY=...

# Optional: Twilio SMS (Only needed if sending SMS alerts)
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=...
```

Run migrations (ensure your database in `DATABASE_URL` is accessible):

```powershell
alembic upgrade head
```

Start backend:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend URLs:
- API Root: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

## 3. Frontend Setup

Open a second terminal from the repository root:

```powershell
Set-Location .\frontend
npm install
Copy-Item .env.example .env
```

Set this value in `frontend/.env` for local development:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Start frontend:

```powershell
npm run dev
```

Frontend is usually available at `http://localhost:5173`.

## 4. Run the System

Keep both terminals running:

- Terminal 1: backend server (`http://localhost:8000`)
- Terminal 2: frontend dev server (`http://localhost:5173`)

Then open `http://localhost:5173` in your browser.

## 5. Seed Data & Admin Account (Optional)

From `backend/` with the virtual environment activated:

```powershell
# Create an admin account (email must end with @bantaykalusugan.com):
..\.venv\Scripts\python.exe create_admin.py

# Seed database with sample patients, vitals, and records for demo:
..\.venv\Scripts\python.exe seed_database.py
```

## 6. Verification and Testing

Backend tests:

```powershell
Set-Location .\backend
..\.venv\Scripts\python.exe -m pytest -q tests
```

Frontend checks:

```powershell
Set-Location .\frontend
npm run lint
npm run test -- --run
npm run build
```

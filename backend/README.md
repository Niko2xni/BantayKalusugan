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
python -m venv .venv
.\.venv\Scripts\Activate.ps1
Set-Location .\backend
pip install -r requirements.txt
```

Create your backend environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set at least:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `FRONTEND_ORIGINS`

Run database migrations:

```powershell
alembic upgrade head
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

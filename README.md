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
python -m venv .venv
.\.venv\Scripts\Activate.ps1
Set-Location .\backend
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `backend/.env` with real values (minimum required):

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `FRONTEND_ORIGINS`

Run migrations:

```powershell
alembic upgrade head
```

Start backend:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend is available at `http://localhost:8000`.

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

- Terminal 1: backend server
- Terminal 2: frontend dev server

Then open the frontend URL in your browser and use the app.

## 5. Optional Verification Commands

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

## 6. Create an Admin Account (Optional)

From `backend/`:

```powershell
..\.venv\Scripts\python.exe create_admin.py
```

Use an email ending with `@bantaykalusugan.com` when creating admin accounts.

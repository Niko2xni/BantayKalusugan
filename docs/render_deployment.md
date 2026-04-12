# BantayKalusugan Render Deployment Guide

This guide covers deploying the application on Render with a separate backend Web Service, a Render PostgreSQL database, and a frontend Static Site.

## What gets deployed where

- Backend: FastAPI application in `backend/`
- Frontend: React/Vite app in `frontend/`
- Database: Render PostgreSQL instance
- Optional integrations: Azure OCR/blob storage and Twilio SMS

## Current readiness

The repository is deployable on Render, but it still needs the Render-specific environment variables configured correctly:

- The backend CORS allowlist must include your Render frontend URL.
- The frontend must point to the deployed backend URL through `VITE_API_BASE_URL`.
- Database migrations must be applied after the Render Postgres database is created.

## 1. Create the database

1. Log in to Render.
2. Create a new PostgreSQL database.
3. Choose a name for the database and wait for provisioning to finish.
4. Copy the internal or external database connection string.

## 2. Deploy the backend

1. In Render, create a new **Web Service**.
2. Connect the GitHub repository that contains this project.
3. Set the **Root Directory** to `backend`.
4. Set the runtime to **Python**.
5. Use this build command:

```bash
pip install -r requirements.txt
```

6. Use this start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

7. Add these environment variables:

- `DATABASE_URL` - the connection string from Render PostgreSQL
- `JWT_SECRET_KEY` - a strong random secret
- `FRONTEND_ORIGINS` - your frontend URL on Render, for example `https://your-frontend.onrender.com`
- `AZURE_STORAGE_CONNECTION_STRING` - required only if you use OCR blob uploads
- `AZURE_STORAGE_CONTAINER_NAME` - optional, defaults to `documents`
- `AZURE_OCR_ENDPOINT` - required only if you use Azure Document Intelligence
- `AZURE_OCR_KEY` - required only if you use Azure Document Intelligence
- `TWILIO_ACCOUNT_SID` - required only if you use SMS
- `TWILIO_AUTH_TOKEN` - required only if you use SMS
- `TWILIO_PHONE_NUMBER` - required only if you use SMS with a direct phone sender
- `TWILIO_MESSAGING_SERVICE_SID` - optional if you use a Twilio Messaging Service

8. Deploy the service.
9. Open the backend URL and confirm the root route responds.

## 3. Run migrations on the backend database

After the backend service is created, apply Alembic migrations so the database matches the code:

```bash
cd backend
alembic upgrade head
```

If you are using the Render shell or a deploy hook, run the command from the `backend` directory context.

## 4. Deploy the frontend

1. In Render, create a new **Static Site**.
2. Connect the same GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Use this build command:

```bash
npm install && npm run build
```

5. Set the publish directory to:

```text
dist
```

6. Add this environment variable:

- `VITE_API_BASE_URL` - the URL of your deployed backend Web Service

7. Deploy the static site.

## 5. Configure SPA routing

The frontend uses `BrowserRouter`, so direct refreshes on routes like `/dashboard` or `/admin` need an SPA rewrite.

In the Render Static Site settings, add a rewrite rule:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

## 6. Verify frontend-backend connectivity

1. Visit the frontend URL.
2. Register a patient account.
3. Log in as a patient and open the dashboard, analytics, schedules, chat, and help pages.
4. Log in as an admin and open the admin dashboard, reports, settings, and audit logs.
5. Confirm that API calls succeed in the browser network tab.

## 7. Update CORS when URLs change

If you change the frontend URL, update `FRONTEND_ORIGINS` on the backend and redeploy the backend.

Examples:

```text
FRONTEND_ORIGINS=https://your-frontend.onrender.com
FRONTEND_ORIGINS=https://your-frontend.onrender.com,https://your-preview-domain.onrender.com
```

## 8. Common issues

- CORS error in the browser: add the frontend URL to `FRONTEND_ORIGINS` and redeploy the backend.
- Blank page on refresh: the Static Site rewrite rule is missing.
- Login or registration fails immediately: `VITE_API_BASE_URL` is pointing at the wrong backend URL.
- Database-related 500 errors: run `alembic upgrade head` against the Render database.
- OCR or SMS features fail: the Azure or Twilio environment variables are missing.

## 9. Useful repository files

- Backend app entrypoint: `backend/app/main.py`
- Backend environment template: `backend/.env.example`
- Frontend entrypoint: `frontend/src/main.jsx`
- Frontend API helpers: `frontend/src/utils/adminApi.js`, `frontend/src/utils/userApi.js`

## 10. Recommended deployment order

1. Create the Render PostgreSQL database.
2. Deploy the backend Web Service.
3. Run Alembic migrations.
4. Deploy the frontend Static Site.
5. Add the frontend URL to `FRONTEND_ORIGINS`.
6. Re-deploy the backend.
7. Test both patient and admin flows end to end.
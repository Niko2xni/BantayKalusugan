# BantayKalusugan: Getting Started & User Setup Guide

Welcome to the **BantayKalusugan** platform! This guide will show you how to start the application on your computer and navigate through both the Patient and Admin interfaces.

---

## 🚀 Part 1: How to Start the Application

The application is split into two parts that must run at the same time: the **Backend Server** (FastAPI) and the **Frontend Website** (React/Vite). You will need to open **two separate terminal windows**.

### Starting the Backend (Terminal 1)
The backend handles the database, authentication, and data logic.
1. Open a terminal and navigate to the project directory.
2. Go into the `backend` folder:
   ```bash
   cd BantayKalusugan/backend
   ```
3. Activate the virtual environment (Windows PowerShell):
   ```bash
   venv\Scripts\activate.ps1
   ```
4. Start the server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The server is now running at `http://localhost:8000`. Keep this window open.*

### Starting the Frontend Website (Terminal 2)
The frontend handles the visuals and user interfaces.
1. Open a *new* terminal window.
2. Go into the `frontend` folder:
   ```bash
   cd BantayKalusugan/frontend
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Look for the local URL in your terminal (usually `http://localhost:5173`) and open it in your web browser. Check carefully if it prompts `http://localhost:5174` or another port, and use that instead.

### Quality Checks (Optional But Recommended)
You can run automated checks before release:

1. Backend tests:
   ```bash
   cd BantayKalusugan/backend
   venv\Scripts\python.exe -m pytest -q
   ```
2. Frontend checks:
   ```bash
   cd BantayKalusugan/frontend
   npm run lint
   npm run test
   npm run build
   ```
3. Full smoke check from repo root (PowerShell):
   ```bash
   ./scripts/smoke_admin.ps1
   ```

### Seed Demo Data (Optional)
If you want realistic sample data for the admin and patient screens, run the backend seed script:

1. Go to the backend folder.
2. Seed the database:
   ```bash
   python seed_database.py
   ```
3. Preview the planned inserts without writing changes:
   ```bash
   python seed_database.py --dry-run
   ```
4. Rebuild only the seed-owned rows and repopulate them:
   ```bash
   python seed_database.py --reset
   ```

The script seeds demo admins, patients, vitals, appointments, notifications, chat messages, admin settings, and sample audit logs.

---

## 👥 Part 2: Creating Accounts

There are strict rules separating Admins (Health Staff) and Patients. 

### Creating an Admin Profile (Backend terminal only)
Standard users **cannot** register as admins on the public website for security purposes. IT staff must provision admin accounts using a secure script.

1. In another terminal, go to the `backend` folder and activate `venv` (as shown above).
2. Run the secure creation script:
   ```bash
   python create_admin.py
   ```
3. Follow the prompts. **Crucial rule:** The email address you input **MUST** end with `@bantaykalusugan.com`. 

### Registering a Normal Patient
1. Go to your frontend website in the browser (e.g., `http://localhost:5173`).
2. Click **Register** in the top right, or scroll to the login page and click the Register link.
3. Fill out the health form fully. You must provide an 11-digit phone number starting with `09`, and your password must be at least 8 characters.

---

## 🧭 Part 3: Navigating the Application

### 🏥 For Admins (Barangay Health Staff)
1. Go to the public Login page.
2. Log in using the admin credentials you created via the Python script.
3. Because you are an admin, the system routes you directly to `/admin` (The Admin Dashboard).
4. **Dashboard:** View overall community blood pressure trends, high-risk patient counts, and monthly registration growth.
5. **Patients Tab (Left Sidebar):** View the database of all registered patients. You can click the "Eye" to view their vitals, or the "Edit" pencil.
6. **Vital Records (Left Sidebar):** This is where health tracking happens. 
   - Click the **Add Vital Signs** button.
   - Select a patient from the dropdown. 
   - Input their BP, heart rate, temperature, etc., and save it to easily track community health!

### 🧑‍🤝‍🧑 For Normal Patients
1. Go to the public Login page.
2. Log in using your registered credentials.
3. Because you are a normal user, you are automatically routed to your personal `/dashboard`.
4. You will be greeted by name dynamically based on your registered data. 
5. Under **Schedules/Analytics**, you can view your personal health summary logic.
6. **Security:** If you attempt to type `/admin` into your URL bar, the system protects the data and instantly bounces you back to your personal dashboard!

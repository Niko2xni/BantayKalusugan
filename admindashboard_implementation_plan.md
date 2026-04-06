# Admin System Management Implementation Plan

This plan focuses purely on developing the **Admin Dashboard's** backend logic for **Patient Management, Audit Logs, and Community Analytics**. It includes critical safety measures for **Data Integrity** when Admins and Patients interact.

## User Review Required

> [!IMPORTANT]
> **Data Collision Prevention:** To prevent "overlapping" data (e.g., duplicate Maria Santos records), we will enforce uniqueness on `email` and `phone_number`. The system will automatically check for matches before allowing any new patient creation.

> [!IMPORTANT]
> **Account Claiming:** For patients added by an Admin (who don't have a password yet), the registration system will allow them to "claim" their existing record by verifying their email/phone instead of creating a duplicate.

> [!TIP]
> **Audit Automation:** Every time an Admin performs an action (Create, Update, Delete), the backend will automatically generate a log in the `AuditLog` table.

## Proposed Changes

---

### Phase 1: Database Models & Schemas

#### [MODIFY] [models.py](file:///c:/Users/Nikolai/Development/School%20Projects/App Dev/BantayKalusuganRepo/BantayKalusugan/backend/app/models.py)
1.  **[NEW] `AuditLog` Model:**
    - `id`, `timestamp`, `admin_id`, `action` (Added, Updated, Deleted), `target_id`, `target_type` (Patient, Vital), `details`.
2.  **Constraint Review:**
    - Ensure `email` and `phone` have `unique=True` in the `User` table.

#### [MODIFY] [schemas.py](file:///c:/Users/Nikolai/Development/School%20Projects/App Dev/BantayKalusuganRepo/BantayKalusugan/backend/app/schemas.py)
- Create `AuditLog` Pydantic models for fetching log data.
- Update `UserCreate` to handle "partial" registration for pre-existing records.

---

### Phase 2: Backend Logic (Integrity & CRUD)

#### [MODIFY] [crud.py](file:///c:/Users/Nikolai/Development/School%20Projects/App Dev/BantayKalusuganRepo/BantayKalusugan/backend/app/crud.py)
- **`check_duplicate_user`**: New function to query DB for existing email/phone before any `INSERT`.
- **`create_audit_log`**: Helper function to record administrative actions.
- **`update_user` / `delete_user`**: Logic to modify patient records including an automatic audit log trigger.
- **`get_community_analytics`**: SQL aggregation for trend charts.

#### [MODIFY] [main.py](file:///c:/Users/Nikolai/Development/School%20Projects/App Dev/BantayKalusuganRepo/BantayKalusugan/backend/app/main.py)
- **`/api/register`**: Add logic to check if user already exists (added by Admin) and trigger "Claim Account" flow if so.
- **`/api/admin/stats`**: Trend chart data.
- **`/api/admin/audit-logs`**: Action history.

---

### Phase 3: Frontend Integration

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/Nikolai/Development/School%20Projects/App Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/AdminDashboard.jsx)
- Connect Add/Edit Patient modals.
- Show an alert if an Admin tries to add an email that already exists.

#### [MODIFY] [AdminAuditLogs.jsx](file:///c:/Users/Nikolai/Development/School%20Projects/App Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/AdminAuditLogs.jsx)
- Replace mock logs with live fetch call.

## Verification Plan

### Automated Tests
- Script to attempt creating a duplicate user and verifying the backend returns a `400 Bad Request` (Conflict).
- Verify that "Account Claiming" successfully updates the `hashed_password` of an existing record.

### Manual Verification
- As Admin: Add a patient with an email.
- As Patient: Try to register with that same email and verify the system invites you to "Claim" the account instead.
- Check "Audit Logs" to ensure all these movements were recorded.

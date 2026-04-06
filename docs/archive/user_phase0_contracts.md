# User Phase 0 Contracts And Integration Map

Date: 2026-04-06
Status: Phase 0 complete baseline for patient self-service.

## 1) Backend API Contracts (Phase 1 scope)

### 1.1 Authenticated Current User

Endpoint: `GET /api/me`
Auth: `Bearer token` required.
Role: any authenticated role.

Success response (`200`):
```json
{
  "id": 12,
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "email": "juan@example.com",
  "phone": "09170001111",
  "date_of_birth": "1994-06-01",
  "sex": "Male",
  "address": "Zone 4",
  "barangay": "Barangay 3",
  "role": "patient",
  "is_active": true,
  "created_at": "2026-04-06T06:00:00Z",
  "updated_at": "2026-04-06T06:00:00Z"
}
```

Error responses:
1. `401`: missing/invalid/expired token.
2. `403`: inactive account.

### 1.2 Current User Profile Update

Endpoint: `PUT /api/me`
Auth: `Bearer token` required.
Role: any authenticated role.

Request body:
```json
{
  "email": "new.email@example.com",
  "phone": "09170002222",
  "address": "Zone 5"
}
```

Validation rules:
1. `email` must be unique.
2. non-admin users cannot use `@bantaykalusugan.com`.
3. `phone` must be non-empty and unique.
4. `address` must be non-empty.

Success response (`200`): full `User` payload.

Error responses:
1. `400`: validation/uniqueness/domain rule violations.
2. `401`: missing/invalid token.
3. `403`: inactive account.

### 1.3 Current User Password Change

Endpoint: `POST /api/me/change-password`
Auth: `Bearer token` required.
Role: any authenticated role.

Request body:
```json
{
  "current_password": "CurrentPass1!",
  "new_password": "NewStrong1!",
  "confirm_password": "NewStrong1!"
}
```

Validation rules:
1. current password must match.
2. new password and confirm password must match.
3. new password must differ from current password.
4. password strength:
   - minimum 8 chars,
   - contains uppercase and lowercase letters,
   - contains at least one number,
   - contains at least one special character.

Success response (`200`):
```json
{
  "message": "Password updated successfully"
}
```

Error responses:
1. `400`: invalid new password / mismatch.
2. `401`: invalid current password or missing token.
3. `403`: inactive account.

### 1.4 Admin-only User Listing Hardening

Endpoints:
1. `GET /api/users/`
2. `GET /api/users/{user_id}`

Auth: `Bearer token` required.
Role: admin only.

Error response for non-admin (`403`):
```json
{
  "detail": "Admin access required"
}
```

## 2) Data Migration And Schema Impact

Phase 1 schema impact: no table or column change.

Migration notes:
1. No Alembic revision required for this step.
2. Existing JWT/auth tables remain unchanged.
3. Existing users table uniqueness constraints on `email` and `phone` are reused by profile updates.

Forward-looking migration placeholders (for later phases):
1. `appointments`
2. `notifications`
3. `chat_messages`

## 3) Frontend Integration Map

### 3.1 Shared Utilities

1. `frontend/src/utils/authSession.js`
   - `clearAuthSession()`
   - `getStoredUser()`
2. `frontend/src/utils/userApi.js`
   - `userFetch(path, options)` with bearer auth and auto-redirect on 401/403.

### 3.2 Updated Session Consumers

1. `frontend/src/components/ProtectedRoute.jsx`
   - now uses shared auth parsing/clearing.
2. `frontend/src/components/Header.jsx`
   - logout clears both user and token.
3. `frontend/src/components/AdminSidebar.jsx`
   - logout uses shared clear helper.
4. `frontend/src/login.jsx`
   - failed login paths clear stale session consistently.
5. `frontend/src/utils/adminApi.js`
   - unauthorized response uses centralized session clearing.

### 3.3 Next Wiring Targets (Phase 2)

1. `ProfilePage.jsx`
   - load from `GET /api/me`
   - save via `PUT /api/me`
   - password form via `POST /api/me/change-password`
2. `Dashboard.jsx`, `AnalyticsPage.jsx`, `VitalsPage.jsx`
   - move to user self-service data endpoints in Phase 2.

## 4) Acceptance Criteria Checklist

1. `/api/me` works with valid token and rejects missing token.
2. `/api/me` profile update validates email/phone uniqueness and domain rules.
3. `/api/me/change-password` applies policy checks and updates hash.
4. `/api/users/*` reads are admin-only.
5. Frontend logout behavior consistently clears both `user` and `token`.
6. New backend tests cover all above contract-critical paths.

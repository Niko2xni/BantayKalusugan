# Admin Dashboard And Reports Implementation Plan

Date: 2026-04-06
Scope: Admin dashboard workflows, admin reports, audit logs, settings, and supporting backend APIs.

## Progress Update

- [x] Phase 1 started and implemented (JWT issue/verify, admin endpoint protection, secure password hashing, frontend token wiring).
- [ ] Phase 2 Data Model And Query Hardening.
- [ ] Phase 3 Admin API Expansion.
- [ ] Phase 4 Frontend Refactor For Dashboard.
- [ ] Phase 5 Reports Implementation.
- [ ] Phase 6 Audit And Settings UX Completion.
- [ ] Phase 7 Testing, Release, And Monitoring.

## 1) Executive Summary

The admin module is functional enough for basic demos (patient CRUD, vital entry, basic charting, basic audit log viewing), but it is not yet production-ready.

Main blockers:
- Security model is UI-only for role checks; backend admin endpoints are not protected.
- Reports page is mostly static demo data and does not consume live analytics APIs.
- Settings page is currently local state only with no persistence.
- Audit logs and analytics are minimal and do not include full actor/target context.
- Data access patterns will not scale (N+1 queries and Python-side aggregation).

This plan prioritizes correctness and safety first, then reporting depth, then UX and operational maturity.

## 2) Current State Analysis

### 2.1 Admin Frontend

Current strengths:
- Shared admin shell/navigation is in place.
- Dashboard supports patient CRUD and vital record CRUD via live backend calls.
- Audit logs page supports list, filter, details modal, and CSV export.

Current gaps:
- Admin dashboard is a monolithic component with mixed concerns and inline form/network logic.
    - See frontend/src/AdminDashboard.jsx.
- Many user messages are browser alert dialogs instead of structured UI feedback.
    - See frontend/src/AdminDashboard.jsx#L199 and nearby handlers.
- Route model is split between URL routes and internal tab state.
    - /admin has internal tabs, while /admin/reports and /admin/settings are separate pages.
- API calls are hardcoded in components (no centralized API client/interceptor/retry behavior).
    - See frontend/src/AdminDashboard.jsx#L68 and frontend/src/AdminAuditLogs.jsx#L19.

### 2.2 Reports Section

Current strengths:
- Good visual structure and chart coverage (bar, pie, line, summary table).

Current gaps:
- Report data is static in-file arrays.
    - See frontend/src/AdminReports.jsx#L34, frontend/src/AdminReports.jsx#L43, frontend/src/AdminReports.jsx#L50.
- Controls do not drive data retrieval or transformation.
    - See frontend/src/AdminReports.jsx#L59 and frontend/src/AdminReports.jsx#L60.
- Export button has no report generation flow (no API call, no file generation logic).
    - See frontend/src/AdminReports.jsx#L137.
- No drill-down from aggregate metrics to patient cohorts.

### 2.3 Audit Logs

Current strengths:
- Backend logs are being generated for create/update/delete actions.
- Admin UI supports filtering and detail viewing.

Current gaps:
- Actor and target naming is partially fabricated on the frontend.
    - staffName is static and patientName is placeholder text.
    - See frontend/src/AdminAuditLogs.jsx#L77 and frontend/src/AdminAuditLogs.jsx#L81.
- Timestamp rendering is locale-dependent then split by spaces, which is brittle.
    - See frontend/src/AdminAuditLogs.jsx#L76 and frontend/src/AdminAuditLogs.jsx#L300.
- Filters/pagination are mostly client-side; server filtering is missing.

### 2.4 Backend Security And Data Layer

Current strengths:
- API surface exists for patients, vitals, admin stats, and admin audit logs.
- Basic duplicate checks exist for create flows.

Current gaps:
- No backend auth token verification or admin authorization dependency on admin routes.
    - See backend/app/main.py admin endpoints around #L115 and #L119.
- Admin actor is hardcoded in CRUD calls (admin_id default 1).
    - See backend/app/crud.py#L94, #L121, #L143, #L165, #L201.
- Password hashing is a placeholder string concatenation approach.
    - See backend/app/crud.py#L22 and backend/create_admin.py.
- Database schema creation is still done at app startup rather than migration-only.
    - See backend/app/main.py#L11.
- Analytics loads all vital rows in memory and aggregates in Python.
    - See backend/app/crud.py#L221 and backend/app/crud.py#L234.

### 2.5 Settings

Current strengths:
- UI scaffolding exists for profile, barangay, system preferences, and password fields.

Current gaps:
- No backend persistence or API contract for settings.
    - See frontend/src/AdminSettings.jsx.
- No real password change flow; validation and secure update are missing.

### 2.6 Testing And Quality Gates

Current state:
- No automated test suite for admin backend or admin frontend flows.
- Existing verify script is useful but ad-hoc and not CI-integrated.

Impact:
- High regression risk for multi-step admin flows (patient + vitals + audit + reports).

## 3) Functionalities To Improve (Existing Features)

Priority P0 (must improve before production):
1. Enforce backend authentication and role-based authorization for all admin APIs.
2. Replace placeholder password hashing/auth with a secure implementation.
3. Remove hardcoded admin actor identity from audit logging.
4. Add robust API-level validation and consistent error contract for patient and vital operations.
5. Move analytics aggregation to efficient SQL and support date-range parameters.

Priority P1 (should improve next):
1. Centralize frontend API access (base URL, auth headers, error mapping, retries).
2. Refactor AdminDashboard into modular components and custom hooks.
3. Replace alert dialogs with non-blocking toasts and field-level errors.
4. Add server-side pagination/filter/sort for patients, vitals, and audit logs.
5. Improve timestamp and locale handling in audit UI.

Priority P2 (quality/perf hardening):
1. Add indexes and constraints for report-heavy queries.
2. Add loading/skeleton/empty/error states consistently across admin pages.
3. Add observability: request IDs, audit event correlation, error logs.

## 4) Functionalities To Add (New Capabilities)

### Reports Module Additions
1. Live report data pipeline for overview, patient statistics, vital trends, and condition breakdown.
2. Date-range filtering (custom start/end, preset windows) with backend support.
3. Report export: CSV first, PDF second.
4. Drill-down actions (click KPI/chart segment -> filtered patient list).
5. Saved report presets (optional P2).

### Admin Operations Additions
1. Real settings persistence (profile, barangay profile, system preferences).
2. Password change endpoint with current password verification and policy checks.
3. Audit log server filtering by action, target type, actor, and date range.
4. Admin activity dashboard cards (today actions, high-risk follow-up queue, overdue records).

## 5) Target Architecture

### Backend
- FastAPI dependency-based auth:
    - get_current_user
    - require_admin
- Service layer for analytics and reporting queries.
- Alembic-only schema evolution (no runtime create_all).
- Canonical response shapes with pagination metadata.

### Frontend
- Admin API module (single source for endpoints and fetch wrappers).
- Feature modules:
    - dashboard
    - reports
    - audit
    - settings
- Shared UI states:
    - loading
    - empty
    - error
    - success toast

## 6) Phased Implementation Plan

### Phase 0: Planning And Contracts (2-3 days)
Deliverables:
1. Final API contracts and DTOs for admin dashboard, reports, audit, and settings.
2. Migration plan for schema/index changes.
3. Test plan matrix for critical admin workflows.

Acceptance criteria:
1. Endpoint contract document reviewed and approved.
2. Breaking changes and backwards compatibility decisions documented.

### Phase 1: Security Foundation (1 week)
Backend tasks:
1. Implement JWT auth flow and token verification dependency.
2. Protect all /api/admin/*, /api/patients/*, and admin-level /api/vitals/* endpoints with require_admin.
3. Replace fake hashing with passlib hashing and verification.
4. Remove hardcoded admin_id defaults; derive actor from authenticated user.

Frontend tasks:
1. Store and send auth token for protected calls.
2. Handle 401/403 globally and redirect safely.

Acceptance criteria:
1. Non-admin users receive 403 on admin endpoints.
2. Audit logs record the real acting admin.
3. Login/logout/token-expiry flows work end-to-end.

### Phase 2: Data Model And Query Hardening (1 week)
Tasks:
1. Add/adjust migrations for report-relevant schema fields and indexes.
2. Add pagination metadata schema for list endpoints.
3. Replace Python in-memory analytics loops with SQL aggregation grouped by month/year.
4. Add date-range params to analytics endpoint(s).

Acceptance criteria:
1. Report queries support date range and return stable month ordering.
2. Large datasets do not require full-table reads in app memory.

### Phase 3: Admin API Expansion (1 week)
Tasks:
1. Introduce report endpoints:
    - GET /api/admin/reports/overview
    - GET /api/admin/reports/trends
    - GET /api/admin/reports/distributions
    - GET /api/admin/reports/export?format=csv|pdf&range=...
2. Enhance audit endpoint with server filters and pagination.
3. Add settings endpoints:
    - GET/PUT /api/admin/settings/profile
    - GET/PUT /api/admin/settings/barangay
    - GET/PUT /api/admin/settings/system
    - POST /api/admin/settings/change-password

Acceptance criteria:
1. All report sections can be fulfilled from backend APIs.
2. Audit UI can request filtered pages from server.
3. Settings changes persist and reload correctly.

### Phase 4: Frontend Refactor For Dashboard (1 week)
Tasks:
1. Split AdminDashboard into focused components:
    - OverviewPanel
    - PatientsPanel
    - VitalsPanel
    - PatientModal
    - VitalModal
2. Create adminApi client and custom hooks.
3. Replace alert dialogs with toast + inline validation.
4. Add loading and error boundaries per panel.

Acceptance criteria:
1. No blocking alerts in normal flows.
2. Dashboard remains functional under network delays/errors.
3. Panel-specific refresh does not force full-page refetch.

### Phase 5: Reports Implementation (1 to 1.5 weeks)
Tasks:
1. Wire report controls to backend query params.
2. Replace static arrays with live data and memoized chart transforms.
3. Implement export flow:
    - CSV in phase 5a
    - PDF in phase 5b
4. Add drill-down interactions into filtered lists.

Acceptance criteria:
1. Report type and date range change visible datasets.
2. Exported files match onscreen filters.
3. Drill-down produces accurate patient/vital subsets.

### Phase 6: Audit And Settings UX Completion (4-5 days)
Tasks:
1. Show real actor names and resolved target labels from API.
2. Robust timestamp formatting using ISO fields and locale-safe formatters.
3. Complete settings save/load UX with dirty-state and save confirmations.

Acceptance criteria:
1. No fabricated placeholder fields in audit entries.
2. Settings are persistent across sessions.

### Phase 7: Testing, Release, And Monitoring (1 week)
Tasks:
1. Add backend tests for:
    - auth + RBAC
    - patient/vitals CRUD
    - audit generation
    - reports queries
2. Add frontend tests for:
    - admin route protection
    - dashboard panel flows
    - reports controls and export triggers
3. Add smoke scripts and pre-release checklist.

Acceptance criteria:
1. All P0/P1 test cases pass in CI.
2. Release checklist signed off.

## 7) Proposed Endpoint Contract Changes

Modify existing:
1. GET /api/admin/stats -> accept date_start/date_end and include richer KPIs.
2. GET /api/admin/audit-logs -> add query params (page, page_size, action, target_type, actor_id, date_start, date_end, search).
3. GET /api/vitals/ -> support server filtering/pagination for admin table views.

Add new:
1. GET /api/admin/reports/overview
2. GET /api/admin/reports/trends
3. GET /api/admin/reports/distributions
4. GET /api/admin/reports/export
5. GET/PUT /api/admin/settings/profile
6. GET/PUT /api/admin/settings/barangay
7. GET/PUT /api/admin/settings/system
8. POST /api/admin/settings/change-password

## 8) Definition Of Done

The admin dashboard and reports work is complete when:
1. Every admin API enforces backend auth and role checks.
2. Reports are fully data-driven with working filters and exports.
3. Settings are persisted through backend APIs.
4. Audit logs show real actor and target context.
5. Performance is acceptable on realistic data volumes.
6. Automated tests cover critical admin flows.

## 9) Risk Register And Mitigations

Risk: Auth refactor breaks current login flow.
Mitigation: Implement compatibility layer during transition and test both admin and patient roles.

Risk: Migration changes affect existing data.
Mitigation: Add reversible Alembic scripts, backup before migration, and dry-run in staging.

Risk: Report queries become slow as data grows.
Mitigation: Use indexed SQL aggregations, add pagination, and profile query plans.

Risk: Scope creep from advanced report requests.
Mitigation: Freeze P0/P1 scope and stage advanced features into P2.

## 10) Suggested Execution Order

1. Phase 0 and Phase 1 before any large frontend report work.
2. Phase 2 and Phase 3 to establish stable, scalable admin APIs.
3. Phase 4 and Phase 5 for dashboard/report UI implementation.
4. Phase 6 and Phase 7 for completion and production readiness.

Estimated timeline: 6 to 8 weeks, depending on team size and review cycles.

# User Dashboard And Patient Experience Implementation Plan

Date: 2026-04-06
Scope: Patient-facing dashboard, analytics, schedules, chat, help, profile, and required backend APIs/data model.

## Progress Update

- [x] Phase 0 Discovery And Contracts.
- [x] Phase 1 Security And Identity Hardening.
- [x] Phase 2 Patient Profile And Vitals APIs.
- [x] Phase 3 User Dashboard And Analytics Data Wiring.
- [x] Phase 4 Schedules, Notifications, And Actions.
- [x] Phase 5 Chat, Help, And Content Improvements.
- [x] Phase 6 Testing, Release, And Monitoring.

## 1) Executive Summary

The user-side experience is visually rich, but most patient pages are currently powered by local mock arrays and client-only state. Core patient workflows (real vitals history, profile persistence, appointment actions, notifications, and support interactions) are not yet connected to backend APIs.

This plan prioritizes:
1. Security and identity safety for patient data.
2. Real backend contracts for patient self-service.
3. Replacing static user content with live data.
4. Completing missing functionality in schedules/profile/chat/notifications.
5. Test coverage for critical user flows.

## 2) Current State Analysis

### 2.1 Routing And Shell

Current strengths:
1. Route-level protection exists and blocks unauthenticated access.
2. Shared patient shell (`Layout`, `Header`, `Sidebar`) provides consistent navigation.
3. User role is respected at route guard level for admin-only pages.

Current gaps:
1. Sidebar does not include a link to `/vitals` even though the route exists.
2. There are legacy/duplicate pages (`App.jsx`, `user_dashboard.jsx`, `AppointmentsPage.jsx`) that overlap with active routes and can cause maintenance drift.
3. Legacy debug routes should remain excluded from production routing (the previous public `/users` test route is now removed).

### 2.2 Dashboard (`Dashboard.jsx`)

Current strengths:
1. Strong visual hierarchy and useful widgets (summary cards, latest vitals, trend chart, appointments).
2. Good UX interactions on metric/date toggles and chart tooltips.

Current gaps:
1. `summaryData`, `vitalsData`, `metricData`, and `appointmentsData` are all hardcoded.
2. No backend calls exist for patient-owned metrics.
3. Insight texts and trend messages are static and not clinically/data driven.

### 2.3 Analytics And Vitals (`AnalyticsPage.jsx`, `VitalsPage.jsx`)

Current strengths:
1. Tables, status tags, and average cards are already designed.
2. Filter UI exists.

Current gaps:
1. Pages are largely duplicated and should be consolidated or clearly differentiated.
2. Date filter behavior is unreliable because date input format and displayed record date format are inconsistent.
3. "Export" button has no live API integration.
4. Data is static and disconnected from `vital_signs` backend records.

### 2.4 Schedules (`SchedulesPage.jsx`)

Current strengths:
1. Good card-based timeline UX and status filtering.
2. Includes contextual details (location/staff/notes).

Current gaps:
1. Appointment list is fully hardcoded.
2. No actions for confirm/cancel/reschedule/request.
3. No backend model/endpoints currently exist for appointments.

### 2.5 Chat (`ChatPage.jsx`)

Current strengths:
1. Clean conversational UI and quick response behavior.
2. Input/send interaction is smooth.

Current gaps:
1. Chat is local-only and not persisted.
2. Response logic is rule-based in component code; no backend chat service or escalation workflow.
3. No auditability or message history by user.

### 2.6 Help (`HelpPage.jsx`)

Current strengths:
1. Clear accordion design and useful starter guidance.

Current gaps:
1. Content is static and not CMS/admin managed.
2. No search, feedback, or "was this helpful" loop.

### 2.7 Profile (`ProfilePage.jsx`)

Current strengths:
1. Profile form layout and editable controls are in place.
2. Read-only identity fields are clearly separated from editable fields.

Current gaps:
1. Save buttons toggle edit state only; no backend persistence.
2. Password change flow has no endpoint wiring.
3. Values are loaded only from `localStorage`, not refreshed from authoritative server data.

### 2.8 Header Notifications (`Header.jsx`)

Current strengths:
1. Notification dropdown and badge UX are implemented.

Current gaps:
1. Notification feed is static and not user-specific.
2. "Mark all as read" is not wired.
3. Logout clears `user` but does not consistently clear token at this layer.

### 2.9 Backend Readiness For User Side (`backend/app/main.py`, `backend/app/crud.py`)

Current strengths:
1. Login and registration are functional.
2. Admin-facing patient/vitals APIs are mature enough for staff workflows.

Current gaps:
1. No patient self-service API set (`/api/me`, profile update, own vitals history, appointments, notifications).
2. All vitals read endpoints currently require admin role.
3. Open user listing/read endpoints should be restricted to prevent PII exposure.
4. No appointment, notification, or chat persistence models currently exist.

## 3) Functionalities To Improve (Existing Features)

Priority P0 (must complete first):
1. Lock down user privacy and identity endpoints (remove or protect open user list/read APIs).
2. Add authenticated patient self-service endpoints and role checks.
3. Replace mock user dashboard/analytics/profile data with live API-backed data.
4. Standardize token/session handling (single logout behavior, token-aware fetch layer).

Priority P1 (next wave):
1. Consolidate duplicate analytics/vitals pages.
2. Add robust empty/loading/error states on all patient sections.
3. Refactor patient API calls into centralized utility + hooks (`userApi`, `usePatientData`).
4. Make date filtering robust and timezone-safe.

Priority P2 (quality and scale):
1. Improve accessibility (keyboard focus, table semantics, aria labels for interactive chart controls).
2. Add content management for Help FAQs and announcement notices.
3. Add user activity and behavior telemetry for product iteration.

## 4) Functionalities To Add (New Capabilities)

### Patient Data And Identity

1. My profile endpoint and update flow (email/phone/address with validation).
2. Change password endpoint for patient accounts.
3. Profile refresh endpoint to avoid stale localStorage-only identity.

### Vitals And Analytics

1. Patient-only vitals history API with filters (`date_start`, `date_end`, pagination).
2. Latest-vitals summary endpoint for dashboard cards.
3. Analytics summary endpoint (averages/trends/status distribution).
4. Export patient vitals (CSV first, optional PDF second).

### Schedules And Appointments

1. Appointment table/model and patient appointment APIs.
2. Actions: request, cancel, reschedule (status-driven).
3. Upcoming reminders and schedule badge counters.

### Notifications

1. Persistent notification feed.
2. Mark-read and mark-all-read endpoints.
3. Notification badges tied to unread counts.

### Chat And Support

1. Persisted chat thread history per patient.
2. Intent-aware bot responses with escalation to staff/support ticket.
3. Admin-viewable support queue (future admin extension).

## 5) Target Backend Contracts

## 5.1 Add Or Update Endpoints

Add:
1. `GET /api/me`
2. `PUT /api/me`
3. `POST /api/me/change-password`
4. `GET /api/me/vitals`
5. `GET /api/me/vitals/latest`
6. `GET /api/me/analytics/overview`
7. `GET /api/me/appointments`
8. `POST /api/me/appointments/request`
9. `PATCH /api/me/appointments/{id}/cancel`
10. `PATCH /api/me/appointments/{id}/reschedule`
11. `GET /api/me/notifications`
12. `PATCH /api/me/notifications/{id}/read`
13. `PATCH /api/me/notifications/read-all`
14. `GET /api/me/chat/messages`
15. `POST /api/me/chat/messages`

Tighten existing:
1. Restrict or remove open `GET /api/users/` and `GET /api/users/{user_id}` for non-admin contexts.
2. Keep admin-only vitals endpoints under explicit admin scope.

## 5.2 Data Model Additions

1. `appointments` table:
Fields: `id`, `patient_id`, `appointment_type`, `health_area`, `scheduled_at`, `status`, `location`, `assigned_staff`, `notes`, `created_at`, `updated_at`.
2. `notifications` table:
Fields: `id`, `user_id`, `title`, `body`, `kind`, `is_read`, `created_at`, `read_at`.
3. `chat_messages` table:
Fields: `id`, `user_id`, `sender_type`, `message`, `channel`, `created_at`.
4. Optional `appointment_status_history` for auditability and timeline rendering.

## 6) Frontend Implementation Strategy

### 6.1 Architecture

1. Introduce `frontend/src/utils/userApi.js` mirroring admin API patterns.
2. Add feature hooks:
   - `usePatientDashboardData`
   - `usePatientVitals`
   - `usePatientAppointments`
   - `usePatientNotifications`
3. Keep `Layout/Header/Sidebar` but source all dynamic counters from API.

### 6.2 Page Refactor Goals

1. `Dashboard.jsx`: replace static cards/charts/appointments with live responses and skeleton states.
2. `AnalyticsPage.jsx` + `VitalsPage.jsx`: merge into one canonical analytics module or split responsibilities cleanly.
3. `SchedulesPage.jsx`: connect to live appointments and add inline actions.
4. `ProfilePage.jsx`: wire save and password actions to backend with optimistic UI + rollback on errors.
5. `ChatPage.jsx`: move response and persistence into backend endpoint calls.
6. `HelpPage.jsx`: optionally source FAQs from backend/admin-managed settings.

### 6.3 UX Improvements

1. Replace inline ad-hoc messages with unified toast/status components.
2. Add reusable empty/error cards for all data sections.
3. Improve mobile behavior for sidebar navigation and table-heavy pages.

## 7) Phased Implementation Plan

### Phase 0 Discovery And Contracts (2-3 days)

Deliverables:
1. Final patient API contracts and response schemas.
2. Database migration plan for appointments/notifications/chat.
3. Frontend integration map per route.

Acceptance criteria:
1. Contract document approved.
2. Breaking changes and compatibility decisions documented.

### Phase 1 Security And Identity Hardening (4-5 days)

Backend tasks:
1. Add/standardize `get_current_user` usage for patient self-service.
2. Restrict open user list/read endpoints.
3. Add `/api/me` and `/api/me/change-password` endpoints.

Frontend tasks:
1. Add shared user API wrapper with auth headers + 401/403 handling.
2. Standardize logout to clear both `user` and `token` everywhere.

Acceptance criteria:
1. Unauthorized users cannot access other patient records.
2. Profile fetch/update uses authenticated identity, not route IDs.

### Phase 2 Patient Profile And Vitals APIs (1 week)

Backend tasks:
1. Implement `/api/me/vitals` and `/api/me/vitals/latest`.
2. Add pagination/filtering for vitals history.
3. Add patient analytics overview endpoint.

Frontend tasks:
1. Wire dashboard cards and analytics table/chart to live endpoints.
2. Add true date-range filtering and proper loading/error states.

Acceptance criteria:
1. Patient sees only their own vitals.
2. Analytics values match backend data within acceptable rounding tolerance.

### Phase 3 Dashboard/Analytics Refactor And Consolidation (1 week)

Tasks:
1. Consolidate `AnalyticsPage` and `VitalsPage` overlap.
2. Extract chart/table/status utilities into reusable modules.
3. Implement export from API response.

Acceptance criteria:
1. No duplicate mock-data logic remains across analytics screens.
2. Export works with active filters.

### Phase 4 Schedules And Notifications (1 to 1.5 weeks)

Backend tasks:
1. Add appointments and notifications tables + migrations.
2. Implement patient appointment list/actions and notification read endpoints.

Frontend tasks:
1. Wire schedules page to real data and actions.
2. Replace static notification dropdown with live feed and unread badge.

Acceptance criteria:
1. Appointment actions persist and reflect status transitions.
2. Notification badge updates after read actions.

### Phase 5 Chat And Help Expansion (4-5 days)

Tasks:
1. Persist chat history by user.
2. Add basic intent routing and escalation path.
3. Optionally externalize FAQ content to backend-managed source.

Acceptance criteria:
1. Chat thread is available after page reload.
2. Support escalation records are traceable.

### Phase 6 Testing, Release, And Monitoring (1 week)

Tasks:
1. Add backend tests for patient auth boundaries and self-service APIs.
2. Add frontend tests for dashboard data rendering, profile save, schedules actions, notifications, and chat.
3. Add smoke script additions for patient flows and role boundary checks.

Acceptance criteria:
1. Critical user journeys pass in CI.
2. Regression matrix includes both patient and admin role paths.

## 8) Definition Of Done

User-side implementation is complete when:
1. Patient pages are data-driven from authenticated APIs (no static health/schedule mocks in production routes).
2. Profile, password, and schedule interactions persist correctly.
3. Patients can view only their own data.
4. Notifications and chat are persisted and role-safe.
5. Automated tests cover key user flows and security boundaries.

## 9) Risk Register And Mitigations

Risk: Expanding user APIs introduces accidental data leakage.
Mitigation: Enforce identity from token only (`/api/me`) and avoid arbitrary user ID query access.

Risk: Appointments/chat schema changes can affect admin roadmap.
Mitigation: Define shared contracts early and align with admin extension points.

Risk: Frontend refactor causes route regressions.
Mitigation: Keep route paths stable; refactor internals behind test coverage.

Risk: Timeline slips due to scope creep (chat AI features).
Mitigation: Keep MVP to persistence + deterministic intents; stage advanced AI later.

## 10) Suggested Execution Order

1. Complete Phase 0 and Phase 1 before any major UI additions.
2. Build Phase 2 API foundation for real patient data.
3. Refactor dashboard/analytics once live data contracts are stable.
4. Add appointments and notifications.
5. Finish with chat/help enhancements and full testing hardening.

Estimated timeline: 5 to 7 weeks depending on team size and parallelization.

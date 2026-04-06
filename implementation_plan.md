# Project Cleanup Implementation Plan

This plan outlines the identification and removal of redundant and obsolete files in the BantayKalusugan repository to improve maintainability and project clarity.

## User Review Required

> [!IMPORTANT]
> The following files have been identified as safe to remove. Please review the list and confirm if any should be retained for historical or future reference.

## Proposed Changes

### [Frontend Cleanup]

#### [MODIFY] [main.jsx](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/main.jsx)
- Update the `/vitals` route to use `AnalyticsPage` directly, allowing for the removal of the redundant `VitalsPage.jsx` wrapper.

#### [DELETE] [App.jsx](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/App.jsx)
- Root entry logic has been moved to `main.jsx`. This file is no longer used.

#### [DELETE] [VitalsPage.jsx](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/VitalsPage.jsx)
- Simple wrapper around `AnalyticsPage`. Redundant once `main.jsx` is updated.

#### [DELETE] [user_dashboard.jsx](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/user_dashboard.jsx)
- Obsolete version of the dashboard. `Dashboard.jsx` is the active implementation.

#### [DELETE] [AppointmentsPage.jsx](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/AppointmentsPage.jsx)
- Obsolete version of the appointments page. `SchedulesPage.jsx` is the active implementation.

#### [DELETE] [AdminDashboard.module.css](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/AdminDashboard.module.css)
- Unused stylesheet. `AdminDashboard.jsx` uses `AdminDashboard.css`.

#### [DELETE] [UserList.jsx](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/frontend/src/components/UserList.jsx)
- Unused component.

### [Root Directory Cleanup]

#### [DELETE] [verify_admin.py](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/verify_admin.py)
- One-off utility script that is no longer needed in the project root.

#### [DELETE] [admindashboard_implementation_plan.md](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/admindashboard_implementation_plan.md)
- Old implementation plan that has been completed and superseded by active documentation.

#### [DELETE] [userdashboard_implementation_plan.md](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/userdashboard_implementation_plan.md)
- Old implementation plan.

#### [DELETE] [user_phase0_contracts.md](file:///c:/Users/Nikolai/Development/School%20Projects/App%20Dev/BantayKalusuganRepo/BantayKalusugan/user_phase0_contracts.md)
- Early-phase design document.

---

## Open Questions

- Are there any other files you've noticed that seem out of place or redundant?
- Do you want to keep the old implementation plans in a `docs/archive` folder instead of deleting them?

## Verification Plan

### Manual Verification
- Run the frontend and ensure all routes (`/dashboard`, `/analytics`, `/admin`, etc.) still work correctly.
- Verify that the `/vitals` route correctly renders the `AnalyticsPage`.
- Check for any "File not found" errors in the browser console.

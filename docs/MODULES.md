# Module Reference

All 13 feature modules. Each module lives in `modules/<name>/` and follows the convention: `components/ hooks/ services/ types/ index.ts`.

See [DEVELOPMENT.md § How to add a new module](./DEVELOPMENT.md#how-to-add-a-new-module) for the folder template.

---

## 1. auth

**Source:** [`modules/auth/`](../modules/auth/)  
**Scenarios:** Auth flow for all 10 scenarios  

Handles the login form and the React hook that calls `/api/auth/login`. The actual token management (HttpOnly cookies, refresh, `/api/auth/me`) lives in `core/auth/` and `app/api/auth/`. This module is the *UI layer* of auth — the login page and form.

Key exports: `LoginPage`, `LoginForm`, `useLogin`

---

## 2. common

**Source:** [`modules/common/`](../modules/common/)  
**Scenarios:** All — provides the shell for all portal pages  

The shared application shell: sidebar navigation, top bar (user display, logout, language switcher), and the `CommonLayout` component that wraps every portal page. Contains `UnauthorizedPage` for RBAC rejections. The sidebar renders role-filtered navigation items and collapses to a hamburger on mobile.

Key exports: `Sidebar`, `TopBar`, `CommonLayout`, `UnauthorizedPage`

---

## 3. dashboard

**Source:** [`modules/dashboard/`](../modules/dashboard/)  
**Scenarios:** All (landing page per role)  

The role-aware landing page. Admin sees system stats (total participants, active events, top organizations, gender distribution, recent enrollments). Federation and Organization users see a welcome card with quick links to their primary tasks. All stats are fetched from a single `/api/dashboard/` endpoint.

Key exports: `DashboardPage`, `AdminDashboard`, `UserWelcome`

---

## 4. users

**Source:** [`modules/users/`](../modules/users/)  
**Scenarios:** User management (implicit in all scenarios)  

Admin CRUD for system users. Creates accounts with Khmer + English names, username, email, role, and password. Edit form has an optional password field (leave blank to keep current password). User list is searchable by username with server-side pagination.

Key exports: `UserList`, `UserForm`, `UserDetailPage`  
RBAC: Admin only

---

## 5. events

**Source:** [`modules/events/`](../modules/events/)  
**Scenarios:** Scenario 01, 02, 06, 07, 08, 10  

The core event lifecycle module. Creates events with Khmer name, type, dates, and location. Manages sport attachment (which sports compete at the event) and organization-sport linking (which federations compete in which sport). Event status transitions: DRAFT → PUBLISHED → ARCHIVED via dedicated endpoints.

Key exports: `EventList`, `EventForm`, `EventDetailPage`, `EventSportManager`, `EventSportOrgManager`, `EventStatusBadge`  
RBAC: Admin (create/edit), all roles (read)

---

## 6. sports

**Source:** [`modules/sports/`](../modules/sports/)  
**Scenarios:** Scenario 01, 05, 07  

Manages sports and their categories. Each sport has a Khmer name and type. Categories define gender (MALE/FEMALE) within a sport for a specific event — used for by-category survey submission and athlete registration. The `SportCategoryManager` handles the category CRUD panel.

Key exports: `SportList`, `SportForm`, `SportDetailPage`, `SportCategoryManager`  
RBAC: Admin only

---

## 7. organizations

**Source:** [`modules/organizations/`](../modules/organizations/)  
**Scenarios:** All (organizations are the scoping unit)  

Manages provinces and ministries. Organizations have a Khmer name, type (`province` or `ministry`), and an optional code. This module is the admin's view of organizations. Federations and Org users see their own organization implicitly through the RBAC scoping.

Key exports: `OrganizationList`, `OrganizationForm`, `OrganizationDetailPage`  
RBAC: Admin only

---

## 8. survey

**Source:** [`modules/survey/`](../modules/survey/)  
**Scenarios:** Scenario 02, 03, 04, 05  

Federation-facing survey forms. Three types: **by-sport** (counts per sport), **by-number** (total only), **by-category** (M/F counts per category). The `SurveyHomePage` lists all available events for the federation. Each survey type has its own form component. Admin sees a read-only submission tab on the event's survey page.

Key exports: `SurveyHomePage`, `BySportSurveyForm`, `ByNumberSurveyForm`, `ByCategorySurveyForm`, `SurveyAdminTab`  
RBAC: Federation (submit), Admin (view all submissions)

---

## 9. submissions

**Source:** [`modules/submissions/`](../modules/submissions/)  
**Scenarios:** Scenario 06  

Admin review queue for survey submissions. Lists all submitted federation surveys. Detail view shows participant counts and current status. `ReviewActions` provides Approve / Reject / Flag buttons wired to the backend FSM endpoints. `StatusBadge` renders colour-coded status chips.

Key exports: `SubmissionList`, `SubmissionDetail`, `ReviewActions`, `StatusBadge`  
RBAC: Admin only

---

## 10. registration-flow

**Source:** [`modules/registration-flow/`](../modules/registration-flow/)  
**Scenarios:** Scenario 07, 08  

The most complex module. Federation registers individual participants (Alone mode) or bulk uploads via CSV (Team mode). Multi-step form: event/sport selection → personal info → document upload → review. Age is computed from `event.start_date` (Red Line #3). Document rule: birth cert if <18, NID/passport if ≥18. Cloudinary presign upload for documents.

Key exports: `RegistrationHomePage`, `RegistrationStepper`, `TeamRegistrationPage`  
RBAC: Federation only

---

## 11. participation

**Source:** [`modules/participation/`](../modules/participation/)  
**Scenarios:** Scenario 09  

Organization registers organizers (leaders, coaches, managers, delegates). Uses the same backend registration endpoint as `registration-flow` (`POST /api/registration/` with `role=leader`) but surfaced through a separate module for clarity. The `OrganizerList` shows all registered organizers for the organization.

Key exports: `OrganizerList`, `OrganizerForm`, `LeaderRoleBadge`  
RBAC: Organization only

---

## 12. reports

**Source:** [`modules/reports/`](../modules/reports/)  
**Scenarios:** Scenario 10  

Admin downloads the 8 Khmer ministry reports as Excel files. Filter bar selects event + organization. Each report card shows title, description, and a download button (disabled with a "Backend required" label if the endpoint is not yet implemented). Preview panels show a sample table for the two fully-implemented reports.

Key exports: `ReportsPage`, `ReportCard`, `ReportFilterBar`, `RosterReportPreview`, `NumbersReportPreview`  
RBAC: Admin only

---

## 13. cards

**Source:** [`modules/cards/`](../modules/cards/)  
**Scenarios:** Cards (bonus module, Week 8)  

Displays participant ID cards filtered by event and organization. Cards show the participant's photo (from Cloudinary), name, sport, role, and organization. Admin sees an organization selector; federation users see only their own org's cards automatically.

Key exports: `CardsPage`, `ParticipantCard`  
RBAC: Admin + Federation

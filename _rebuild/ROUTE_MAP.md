# ROUTE_MAP.md — Scenarios → Routes → Modules → Endpoints

> Maps every scenario from `SCENARIOS.md` to the concrete Next.js routes, modules, and backend calls.  
> All routes live under `app/(portal)/` (authenticated shell).

---

## Route Map Table

| Scenario | Route Path(s) | Module(s) | Primary Components | Backend Endpoints |
|----------|--------------|-----------|-------------------|-------------------|
| S01 — Create Event | `/events` `/events/new` `/events/[event_id]` | `events`, `sports` | `EventList`, `EventForm`, `EventDetail`, `EventSportManager`, `EventSportOrgManager` | `GET/POST /api/events/` · `GET/PATCH /api/events/{event_id}` · `POST /api/events/add-sport` · `POST /api/events/add-org-to-sport` · `GET /api/sports/` · `GET /api/organization/` |
| S02 — Admin Survey Overview | `/events/[event_id]/surveys` | `survey` (admin view) | `SurveyAdminTab`, `SurveySubmissionTable` | `GET /api/participation-per-sport/` · `GET /api/events/{event_id}/organizations` |
| S03 — Federation By-Sport Survey | `/surveys/[event_id]/by-sport` | `survey` | `BySportSurveyForm`, `SportRowInput` | `GET /api/participation-per-sport/` · `POST /api/participation-per-sport/` · `PATCH /api/participation-per-sport/{id}` · `GET /api/events/{event_id}/sports` |
| S04 — Federation By-Number Survey | `/surveys/[event_id]/by-number` | `survey` | `ByNumberSurveyForm` | `POST /api/participation-per-sport/` · `GET /api/events/{event_id}/sports` |
| S05 — Federation By-Category Survey | `/surveys/[event_id]/by-category` | `survey` | `ByCategorySurveyForm`, `CategoryRowInput` | `GET /api/events/{event_id}/sports/{sport_id}/categories` · `POST /api/participation-per-sport/` |
| S06 — Admin Review Submissions | `/submissions` `/submissions/[id]` | `submissions` | `SubmissionList`, `SubmissionDetail`, `ReviewActions` | `GET /api/participation-per-sport/` · `GET /api/participation-per-sport/{id}` · `PATCH /api/participation-per-sport/{id}` |
| S07 — Register Participant (Alone) | `/register` `/register/new` | `registration-flow` | `RegistrationStepper`, `PersonalInfoStep`, `SportStep`, `DocumentStep`, `ReviewStep` | `GET /api/events/` · `GET /api/events/{event_id}` · `GET /api/events/{event_id}/sports` · `GET /api/cloudinary/presign-url` · `POST /api/registration/` · `GET /api/registration/` |
| S08 — Register Participants (Team) | `/register/team` | `registration-flow` | `TeamRegistrationUploader`, `RegistrationPreviewTable`, `BatchProgressBar` | `GET /api/cloudinary/presign-url` (per row) · `POST /api/registration/` (×N) |
| S09 — Register Organizers | `/participation` `/participation/new` | `participation` | `OrganizerForm`, `OrganizerList`, `LeaderRoleBadge` | `GET /api/registration/?role=leader&organization_id=N` · `POST /api/registration/` · `PATCH /api/registration/update` · `DELETE /api/registration/delete` · `GET /api/cloudinary/presign-url` |
| S10 — Generate Reports | `/reports` | `reports` | `ReportList`, `ReportGenerateForm`, `ReportDownloadButton` | `GET /api/excel/org-sport` · `GET /api/excel/org-sport-participant` · `GET /api/events/` · `GET /api/organization/` |

---

## Full Route Inventory

### Auth routes (outside portal shell)

| Route | Module | Purpose |
|-------|--------|---------|
| `/login` | `auth` | Login page — `LoginForm` |
| `/unauthorized` | `common` | 403 page — `UnauthorizedPage` |

### Portal routes (inside `app/(portal)/`)

| Route | Module | Purpose | Roles |
|-------|--------|---------|-------|
| `/dashboard` | `dashboard` | Role-aware landing page | All |
| `/events` | `events` | List all events | admin |
| `/events/new` | `events` | Create event form | admin |
| `/events/[event_id]` | `events` | Event detail + sport manager | admin |
| `/events/[event_id]/surveys` | `survey` | Admin survey overview per event | admin |
| `/sports` | `sports` | List all sports | admin |
| `/sports/new` | `sports` | Create sport form | admin |
| `/sports/[sport_id]` | `sports` | Sport detail + category manager | admin |
| `/organizations` | `organizations` | List federations + organizations | admin |
| `/organizations/new` | `organizations` | Create organization form | admin |
| `/organizations/[org_id]` | `organizations` | Org detail | admin |
| `/users` | `users` | Admin user management | admin |
| `/users/new` | `users` | Create user form | admin |
| `/users/[user_id]` | `users` | User detail / edit | admin |
| `/surveys` | `survey` | Federation survey home | user1 |
| `/surveys/[event_id]/by-sport` | `survey` | By-sport survey form | user1 |
| `/surveys/[event_id]/by-number` | `survey` | By-number survey form | user1 |
| `/surveys/[event_id]/by-category` | `survey` | By-category survey form | user1 |
| `/submissions` | `submissions` | Admin review queue | admin |
| `/submissions/[id]` | `submissions` | Single submission review | admin |
| `/register` | `registration-flow` | Federation registration home | user1 |
| `/register/new` | `registration-flow` | Add participant (alone mode) | user1 |
| `/register/[enroll_id]` | `registration-flow` | Participant detail / edit | user1 |
| `/register/team` | `registration-flow` | Bulk CSV upload | user1 |
| `/participation` | `participation` | Organization organizer list | user2 |
| `/participation/new` | `participation` | Register organizer | user2 |
| `/participation/[enroll_id]` | `participation` | Organizer detail / edit | user2 |
| `/reports` | `reports` | Report generation list | admin |
| `/cards` | `cards` | Card management | admin, user1 |

---

## Module Dependency Map

```
auth          ← no upstream dependencies
common        ← auth
dashboard     ← auth, common
users         ← auth, common

events        ← auth, common, sports, organizations
sports        ← auth, common
organizations ← auth, common

survey        ← auth, common, events, sports, organizations
submissions   ← auth, common, survey

registration-flow ← auth, common, events, sports, organizations
participation     ← auth, common, events, sports, organizations

reports  ← auth, common, events, organizations, registration-flow, participation
cards    ← auth, common, events, organizations, registration-flow
```

---

## Page File Requirements Per Route

Every `app/(portal)/<route>/` directory must contain:

| File | Purpose |
|------|---------|
| `page.tsx` | Main page — imports from module, wraps in `PageShell` |
| `loading.tsx` | Shows `PageLoadingState` (skeleton) |
| `error.tsx` | Recoverable error UI with retry + back link |

Example:
```
app/(portal)/events/
  page.tsx        ← EventList page
  loading.tsx     ← EventList skeleton
  error.tsx       ← EventList error
  new/
    page.tsx      ← EventForm (create mode)
    loading.tsx
    error.tsx
  [event_id]/
    page.tsx      ← EventDetail page
    loading.tsx
    error.tsx
    surveys/
      page.tsx    ← SurveyAdminTab
      loading.tsx
      error.tsx
```

---

## RBAC Guard Matrix

| Route prefix | Required role(s) | Guard mechanism |
|-------------|-----------------|----------------|
| `/dashboard` | All authenticated | `<ProtectedRoute requiredRoles={['admin','user1','user2','guest']} />` |
| `/events*` | admin | `<ProtectedRoute requiredRoles={['admin']} />` |
| `/sports*` | admin | `<ProtectedRoute requiredRoles={['admin']} />` |
| `/organizations*` | admin | `<ProtectedRoute requiredRoles={['admin']} />` |
| `/users*` | admin | `<ProtectedRoute requiredRoles={['admin']} />` |
| `/submissions*` | admin | `<ProtectedRoute requiredRoles={['admin']} />` |
| `/reports*` | admin | `<ProtectedRoute requiredRoles={['admin']} />` |
| `/surveys*` | user1 (Federation) | `<ProtectedRoute requiredRoles={['user1']} />` |
| `/register*` | user1 (Federation) | `<ProtectedRoute requiredRoles={['user1']} />` |
| `/participation*` | user2 (Organization) | `<ProtectedRoute requiredRoles={['user2']} />` |
| `/cards*` | admin, user1 | `<ProtectedRoute requiredRoles={['admin','user1']} />` |

---

## Data Scoping Rules per Route

| Route | Scoping param | Source |
|-------|--------------|--------|
| `/surveys*` | `organization_id` | `auth.user.organization_id` |
| `/register*` (list) | `organization_id` | `auth.user.organization_id` |
| `/participation*` (list) | `organization_id` | `auth.user.organization_id` |
| `/cards*` (federation view) | `org_id` | `auth.user.organization_id` |
| All admin routes | None — admin sees all | — |

---

## Cross-Module Shared Data

| Data | Where used | Source |
|------|-----------|--------|
| Event list + detail | events, survey, registration-flow, reports, cards | `GET /api/events/` |
| Sports list | events, sports, survey, registration-flow | `GET /api/sports/` |
| Organizations list | events, organizations, reports, cards | `GET /api/organization/` |
| Current user (role, org_id) | All authenticated routes | `GET /api/auth/session/{user_id}` via AuthContext |
| Cloudinary presign | registration-flow, participation | `GET /api/cloudinary/presign-url` |

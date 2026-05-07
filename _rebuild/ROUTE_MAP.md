# Route Map

Maps each scenario to Next.js routes, modules, primary components, and backend endpoints.

All portal routes live under `app/(portal)/` with a shared layout (sidebar + topbar).
Auth routes live under `app/(auth)/`.

---

## Route table

| Scenario | Route(s) | Module(s) | Primary Components | Backend Endpoints |
|----------|----------|-----------|-------------------|-------------------|
| 01 — Create event + sports | `/events` `/events/[event_id]` `/events/[event_id]/sports` | `events`, `sports` | `EventList`, `EventCreateForm`, `EventDetail`, `SportPicker`, `OrgPicker`, `SportQuotaTable` | `POST /api/events/`, `GET /api/events/`, `GET /api/events/{id}`, `PATCH /api/events/{id}`, `GET /api/sports/`, `POST /api/events/add-sport`, `POST /api/events/add-org-to-sport` |
| 02 — Admin sends survey | `/events/[event_id]/surveys/new` | `survey` | `SurveyTypeSelector`, `FederationPicker`, `SurveySendForm` | `GET /api/organization/`, `GET /api/events/{id}/sports` *(survey send endpoint missing)* |
| 03 — Federation: by-sport survey | `/surveys` `/surveys/[survey_id]/by-sport` | `survey` | `SurveyList`, `BySportForm`, `SportHeadcountRow` | `GET /api/participation-per-sport/`, `POST /api/participation-per-sport/`, `PATCH /api/participation-per-sport/{id}` |
| 04 — Federation: by-number survey | `/surveys` `/surveys/[survey_id]/by-number` | `survey` | `SurveyList`, `ByNumberForm` | Same as 03 |
| 05 — Federation: by-category survey | `/surveys` `/surveys/[survey_id]/by-category` | `survey` | `SurveyList`, `ByCategoryForm`, `CategoryHeadcountRow` | `GET /api/events/{id}/sports/{sport_id}/categories`, `POST /api/participation-per-sport/` |
| 06 — Admin reviews submissions | `/submissions` `/submissions/[id]` | `submissions` | `SubmissionList`, `SubmissionDetail`, `FsmActionBar`, `StatusBadge` | `GET /api/participation-per-sport/` *(approve/reject endpoints missing)* |
| 07 — Register participants (ALONE) | `/register` `/register/new` | `registration-flow` | `RegistrationDashboard`, `ParticipantForm`, `DocumentUploader`, `QuotaProgress` | `GET /api/registration/`, `POST /api/registration/`, `GET /api/cloudinary/presign-url`, `GET /api/events/{id}/sports`, `GET /api/events/{id}/sports/{sport_id}/categories` |
| 08 — Register participants (TEAM) | `/register` `/register/team` | `registration-flow` | `RegistrationDashboard`, `TeamRegistrationTable`, `DocumentUploader` | Same as 07 |
| 09 — Org registers organizers | `/participation` `/participation/new` | `participation` | `OrganizerList`, `OrganizerForm`, `DocumentUploader` | `POST /api/registration/` (role=leader), `GET /api/registration/`, `GET /api/cloudinary/presign-url` |
| 10 — Generate reports | `/reports` | `reports` | `ReportList`, `ReportCard`, `EventSelector` | `GET /api/excel/org-sport`, `GET /api/excel/org-sport-participant` *(6 reports missing)* |

---

## Auth routes

| Route | Module | Component | Notes |
|-------|--------|-----------|-------|
| `/login` | `auth` | `LoginForm` | `POST /api/auth/login`; sets HttpOnly cookie |
| `/unauthorized` | `common` | `UnauthorizedPage` | Shown on 403; no backend call |

---

## Full route tree

```
app/
├── (auth)/
│   ├── layout.tsx                    — unauthenticated layout (no sidebar)
│   └── login/
│       └── page.tsx                  — LoginForm
│
└── (portal)/
    ├── layout.tsx                    — authenticated layout (Sidebar + TopBar)
    ├── dashboard/
    │   └── page.tsx                  — role-aware dashboard (GET /api/dashboard)
    │
    ├── events/
    │   ├── page.tsx                  — EventList
    │   ├── [event_id]/
    │   │   ├── page.tsx              — EventDetail
    │   │   └── sports/
    │   │       └── page.tsx          — EventSportManager (add/remove sports, orgs)
    │   └── new/
    │       └── page.tsx              — EventCreateForm
    │
    ├── sports/
    │   ├── page.tsx                  — SportList
    │   └── [sport_id]/
    │       └── page.tsx              — SportDetail + CategoryManager
    │
    ├── organizations/
    │   ├── page.tsx                  — OrganizationList
    │   └── [org_id]/
    │       └── page.tsx              — OrganizationDetail
    │
    ├── users/
    │   ├── page.tsx                  — UserList
    │   └── [user_id]/
    │       └── page.tsx              — UserDetail
    │
    ├── surveys/
    │   ├── page.tsx                  — SurveyList (federation: pending surveys)
    │   └── [survey_id]/
    │       ├── by-sport/
    │       │   └── page.tsx          — BySportForm
    │       ├── by-number/
    │       │   └── page.tsx          — ByNumberForm
    │       └── by-category/
    │           └── page.tsx          — ByCategoryForm
    │
    ├── submissions/
    │   ├── page.tsx                  — SubmissionList (admin review queue)
    │   └── [id]/
    │       └── page.tsx              — SubmissionDetail + FsmActionBar
    │
    ├── register/
    │   ├── page.tsx                  — RegistrationDashboard + ParticipantList
    │   ├── new/
    │   │   └── page.tsx              — ParticipantForm (ALONE mode)
    │   └── team/
    │       └── page.tsx              — TeamRegistrationTable (TEAM mode)
    │
    ├── participation/
    │   ├── page.tsx                  — OrganizerList
    │   └── new/
    │       └── page.tsx              — OrganizerForm
    │
    ├── reports/
    │   └── page.tsx                  — ReportList (8 report cards)
    │
    └── cards/
        └── page.tsx                  — CardList (out of scope, lowest priority)
```

---

## Module → route ownership

| Module | Owns routes | RBAC |
|--------|-------------|------|
| `auth` | `/login` | public |
| `common` | `/unauthorized`, shared layout components | all authenticated |
| `dashboard` | `/dashboard` | Admin, Super Admin |
| `events` | `/events`, `/events/[event_id]`, `/events/[event_id]/sports` | Admin, Super Admin |
| `sports` | `/sports`, `/sports/[sport_id]` | Admin, Super Admin |
| `organizations` | `/organizations`, `/organizations/[org_id]` | Admin, Super Admin |
| `users` | `/users`, `/users/[user_id]` | Admin, Super Admin |
| `survey` | `/surveys`, `/surveys/[survey_id]/**` | Federation (submit), Admin (send) |
| `submissions` | `/submissions`, `/submissions/[id]` | Admin, Super Admin |
| `registration-flow` | `/register`, `/register/new`, `/register/team` | Federation |
| `participation` | `/participation`, `/participation/new` | Organization |
| `reports` | `/reports` | Admin, Super Admin |
| `cards` | `/cards` | Admin, Federation (out of scope) |

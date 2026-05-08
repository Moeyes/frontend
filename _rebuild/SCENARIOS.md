# SCENARIOS.md — Canonical User Journey Spec

> **This is the single source of truth for every module rebuild.**  
> Every Prompt 6 run must read this file and verify all applicable scenarios PASS before committing.  
> Last updated: based on `_contract/ENDPOINTS.md` + `_contract/api.types.ts` as of 2026-05-08.

---

## Cross-Cutting Rules (embedded in every scenario below)

| Rule | Enforcement |
|------|-------------|
| **Khmer-first UI** | All labels, buttons, headings use `t('key')` from `messages/kh.json`. English secondary. |
| **RBAC scoping** | `admin` sees all. `user1` (Federation) scopes by `organization_id`. `user2` (Organization) scopes by `organization_id`. Pass scope params explicitly — never rely on backend auto-filter. |
| **Age from event date** | `computeAgeAtEvent(dob, event.start_date)` — **never** `new Date()` |
| **Document rule** | `age < 18 at event.start_date` → `birthCertificateUrl` required. `age ≥ 18` → `nationalIdUrl` or `passportUrl` required |
| **FSM via endpoints** | Status transitions call dedicated endpoints. Never PATCH a `status` field directly. ⚠️ See gap notes per scenario. |
| **Idempotency** | All POST/PUT/PATCH go through `core/api/client.ts` which auto-injects `Idempotency-Key: crypto.randomUUID()`. |
| **Loading/Empty/Error** | Every list: skeleton while loading, `PageEmptyState` when empty, `QueryBoundary` error + retry. |
| **Optimistic updates** | Mutations update React Query cache immediately, roll back on error. |
| **Tokens** | HttpOnly cookies only. Never localStorage. `app/api/auth/login/route.ts` sets them. |
| **UserRole enum** | `admin` = Admin/Super Admin · `user1` = Federation · `user2` = Organization · `guest` = Organizer |

---

## SCENARIO 01 — Admin Creates Event, Attaches Sports, Publishes

**Actor:** Admin (`role = 'admin'`)  
**Module:** `events`, `sports`  
**Week:** 3

### Preconditions
- Admin is logged in
- At least 1 sport exists in the system
- At least 1 organization exists in the system

### Steps
1. Admin navigates to **Events** → clicks **"បង្កើតព្រឹត្តិការណ៍"** (Create Event)
2. Fills form:
   - `name_kh` (required) — Khmer event name
   - `type` (required) — dropdown from `eventType` enum (all values are Khmer strings)
   - `description` (optional)
   - `start_date`, `end_date`, `open_register_date`, `close_register_date`, `location` (optional)
3. Submits → `POST /api/events/` → sees new event in list
4. Opens event detail page → clicks **"បន្ថែមកីឡា"** (Add Sport)
5. Selects a sport from dropdown → submits → `POST /api/events/add-sport`  
   _(Repeat for each sport; `SportsEventCreate` takes `events_id` + `sports_id` only — **no quota field on backend**)_
6. For each attached sport, clicks **"បន្ថែមមណ្ឌល"** (Link Organization) → selects org → `POST /api/events/add-org-to-sport`
7. ⚠️ **GAP:** No "Publish" endpoint exists. `EventPublic` has no `status` field.  
   **Frontend behavior:** After attaching sports, the event is considered "active." Display a status badge computed from `start_date`/`end_date` client-side (UPCOMING / ACTIVE / ENDED). Do NOT PATCH a status field. Coordinate with teammate if a publish FSM is needed.

### Backend Endpoints
| Step | Method | Path |
|------|--------|------|
| Create event | `POST` | `/api/events/` |
| List events (for nav back) | `GET` | `/api/events/` |
| Get event detail | `GET` | `/api/events/{event_id}` |
| List attached sports | `GET` | `/api/events/{event_id}/sports` |
| Attach sport | `POST` | `/api/events/add-sport` |
| Remove sport | `DELETE` | `/api/events/remove-sport-from-event` |
| Link org to sport | `POST` | `/api/events/add-org-to-sport` |
| Unlink org from sport | `DELETE` | `/api/events/delete-event-sport-org-link` |
| List orgs in event | `GET` | `/api/events/{event_id}/organizations` |
| List sports (for picker) | `GET` | `/api/sports/` |
| List orgs (for picker) | `GET` | `/api/organization/` |

### Loading / Empty / Error States
- Events list: skeleton (3 rows) → `PageEmptyState` with CTA "បង្កើតព្រឹត្តិការណ៍" → QueryBoundary error
- Attached sports sub-list: skeleton → "មិនទាន់មានកីឡា" empty state → error
- Sport picker dropdown: loading spinner → empty "មិនមានកីឡា" option → error toast

### Success Criterion
- Event appears in list with correct Khmer name and type
- Attached sports visible under event detail
- Orgs linked to sports visible
- All date fields formatted in Khmer locale (dd/MM/yyyy)

### Failure Modes
| Failure | Handling |
|---------|---------|
| Duplicate event name | Show server error inline on `name_kh` field |
| Sport already attached | Show toast "កីឡានេះបានភ្ជាប់រួចហើយ" |
| Org already linked to that sport | Show toast error |
| Network error on create | Rollback optimistic add; show retry |
| `start_date` after `end_date` | Client-side Zod validation before submit |

### i18n Namespaces
- `events.createTitle`, `events.editTitle`, `events.form.*`
- `events.type.*` (map eventType enum values to display labels)
- `events.sports.*`, `events.orgs.*`
- `common.save`, `common.cancel`, `common.delete`, `common.confirmDelete`

---

## SCENARIO 02 — Admin Initiates Survey for Federations

**Actor:** Admin (`role = 'admin'`)  
**Module:** `survey` (admin view), `events`  
**Week:** 4

### Preconditions
- An event exists with at least 1 sport attached
- At least 1 federation (`user1`) exists and is linked to the event via `add-org-to-sport`

### Steps
1. Admin opens event detail → sees **"ការស្ទង់មតិ"** (Survey) tab
2. Admin chooses survey type: **by-sport**, **by-number**, or **by-category**  
   _(These are frontend-only concepts — all map to `POST /api/participation-per-sport/`)_
3. Admin sees a list of survey submissions for this event — `GET /api/participation-per-sport/?events_id={event_id}` ⚠️ (see gap below)
4. Admin can see which federations have/haven't submitted

### ⚠️ Backend Gaps for This Scenario
- No "send survey" endpoint exists. Surveys are not "dispatched" by admin — they are available to federations by virtue of being linked to the event.
- `GET /api/participation-per-sport/` only supports `skip`/`limit` — no `events_id` filter param. **Frontend must filter client-side after fetching all entries, or teammate must add filter param.**
- No survey `status` field — no way to know if federation has submitted (PENDING) vs not.

### Backend Endpoints
| Step | Method | Path |
|------|--------|------|
| List participation entries | `GET` | `/api/participation-per-sport/` |
| Get event detail | `GET` | `/api/events/{event_id}` |
| List event orgs | `GET` | `/api/events/{event_id}/organizations` |

### Loading / Empty / Error States
- Survey list: skeleton → "មិនទាន់មានការស្ទង់មតិ" empty state → error + retry

### Success Criterion
- Admin sees a table of federations for this event
- Each row shows federation name and survey submission status (submitted count vs 0)

### Failure Modes
| Failure | Handling |
|---------|---------|
| No orgs linked to event | Show empty state with tip to link orgs first |
| API error on fetch | QueryBoundary error UI with retry |

### i18n Namespaces
- `survey.adminTab`, `survey.statusLabels.*`, `survey.type.*`

---

## SCENARIO 03 — Federation Submits "By-Sport" Survey

**Actor:** Federation (`role = 'user1'`)  
**Module:** `survey`  
**Week:** 4

### Preconditions
- Federation user is logged in; `auth.organization_id` is set
- An event exists with at least 1 sport linked to this federation's org
- RBAC: federation can only submit for their own `organization_id`

### Steps
1. Federation navigates to **"ការស្ទង់មតិ"** tab → sees list of events/sports to fill
2. Selects an event → sees per-sport form rows (one row per sport the federation is linked to for that event)
3. For each sport row, fills in:
   - `athlete_male_count` (ចំនួនអ្នកចូលរួមប្រុស)
   - `athlete_female_count` (ចំនួនអ្នកចូលរួមស្រី)
   - `leader_male_count` (ចំនួនមេដឹកនាំប្រុស)
   - `leader_female_count` (ចំនួនមេដឹកនាំស្រី)
4. Submits each row → `POST /api/participation-per-sport/` with:
   ```json
   {
     "org_id": <sports_event_org_join_id>,
     "events_id": <event_id>,
     "sports_id": <sport_id>,
     "organization_id": <federation_org_id>,
     "athlete_male_count": N,
     "athlete_female_count": N,
     "leader_male_count": N,
     "leader_female_count": N
   }
   ```
5. Success → row marked as submitted; counts shown

### RBAC Scoping
- `organization_id` in request body must equal `auth.user.organization_id`
- Never allow submitting for a different org
- Federation sees only their own submissions: filter `GET /api/participation-per-sport/` by `organization_id` client-side (no server-side filter param available)

### Backend Endpoints
| Step | Method | Path |
|------|--------|------|
| List existing entries | `GET` | `/api/participation-per-sport/` |
| Submit entry | `POST` | `/api/participation-per-sport/` |
| Update entry | `PATCH` | `/api/participation-per-sport/{id}` |
| List event sports for this org | `GET` | `/api/events/{event_id}/sports/{sport_id}/orgs` |
| Get event (for start_date, name) | `GET` | `/api/events/{event_id}` |

### Loading / Empty / Error States
- Sports form list: skeleton → "មិនទាន់មានកីឡា" if no sports linked to this federation for this event
- Submission success: inline toast "រួចរាល់" + row status update

### Success Criterion
- All sport rows submitted
- Each submitted row shows the entered counts
- Federation cannot edit another federation's submission

### Failure Modes
| Failure | Handling |
|---------|---------|
| Negative count | Zod: `z.number().int().min(0)` — inline error |
| Duplicate submission for same sport | Backend may reject; show field-level error "បានដាក់ស្នើរួចហើយ" |
| Network error | Rollback optimistic update; show retry button on row |
| Submitting for wrong org_id | Client-side guard: compare with `auth.user.organization_id` |

### i18n Namespaces
- `survey.bySport.*`, `survey.fields.*` (athlete_male, athlete_female, leader_male, leader_female)
- `survey.submit`, `survey.submitted`, `survey.edit`

---

## SCENARIO 04 — Federation Submits "By-Number" Survey

**Actor:** Federation (`role = 'user1'`)  
**Module:** `survey`  
**Week:** 4

### Preconditions
- Same as Scenario 03

### Steps
1. Federation selects "by-number" survey form
2. Fills in **total counts only** (not broken down by sport):
   - Total athletes (M + F combined or separate)
   - Total leaders (M + F combined or separate)
3. Submits → `POST /api/participation-per-sport/` using totals spread across male/female fields

### ⚠️ Backend Constraint
- No dedicated "by-number" endpoint. This scenario reuses `POST /api/participation-per-sport/`.
- The distinction is **frontend-only**: "by-number" form collects totals and maps them to the male/female fields.
- `sports_id` is still required. For a "by-number" form, the frontend must either:
  - Submit one entry per sport with equal distribution (not ideal), **or**
  - Use a special sentinel sport (needs teammate clarification)
- **Flag to teammate:** Is there a "global" sports_id for by-number surveys, or should by-number be a single-entry survey?

### Backend Endpoints
Same as Scenario 03.

### Loading / Empty / Error States
Same as Scenario 03.

### Success Criterion
- Single total-count entry submitted
- Federation sees confirmation of total participant count

### Failure Modes
Same as Scenario 03 plus:
| Failure | Handling |
|---------|---------|
| sports_id ambiguity | Show error "Please clarify sport" if no valid sports_id found |

### i18n Namespaces
- `survey.byNumber.*`

---

## SCENARIO 05 — Federation Submits "By-Category" Survey

**Actor:** Federation (`role = 'user1'`)  
**Module:** `survey`  
**Week:** 4

### Preconditions
- Same as Scenario 03
- The event's sports have categories defined (`GET /api/events/{event_id}/sports/{sport_id}/categories`)

### Steps
1. Federation selects "by-category" survey form
2. For each sport → for each category, fills in M/F counts
3. Category info available from `GET /api/events/{event_id}/sports/{sport_id}/categories` → `[CategoryPublic]`
4. Submits per-category breakdowns

### ⚠️ Backend Constraint
- `ParticipationPerSportCreate` has no `category_id` or per-category breakdown field.
- The `AttendedCategory` schema (`category: string, gender: genderEnum`) exists in the spec but is not used in any visible endpoint request body.
- **Gap:** No backend field for category-level participation counts. Frontend workaround: store category breakdown in a local state, aggregate to male/female totals before submission. OR confirm with teammate that `AttendedCategory` data goes somewhere.
- **Flag to teammate:** How does by-category data get persisted? Is there a separate endpoint or a nested field we're missing?

### Backend Endpoints
| Step | Method | Path |
|------|--------|------|
| List categories for sport | `GET` | `/api/events/{event_id}/sports/{sport_id}/categories` |
| Submit (aggregated totals) | `POST` | `/api/participation-per-sport/` |

### Success Criterion
- Category breakdown displayed to user
- Aggregated totals submitted successfully

### i18n Namespaces
- `survey.byCategory.*`

---

## SCENARIO 06 — Admin Reviews Surveys (Approve / Reject / Flag)

**Actor:** Admin (`role = 'admin'`)  
**Module:** `submissions`  
**Week:** 4

### Preconditions
- At least one federation has submitted a participation-per-sport entry
- Admin is logged in

### Steps
1. Admin navigates to **"ការពិនិត្យ"** (Submissions / Review) page
2. Sees list of submissions → `GET /api/participation-per-sport/` (all entries, no scoping for admin)
3. Opens a submission to review detail → `GET /api/participation-per-sport/{id}`
4. Chooses action:
   - **Approve** → ideally `POST /api/participation-per-sport/{id}/approve` ⚠️ (does not exist)
   - **Reject** → ideally `POST /api/participation-per-sport/{id}/reject` ⚠️ (does not exist)
   - **Flag** → ideally `POST /api/participation-per-sport/{id}/flag` ⚠️ (does not exist)

### ⚠️ Critical Backend Gap — FSM Transitions Missing
- `ParticipationPerSportPublic` has **no `status` field**.
- No FSM transition endpoints exist (`/approve`, `/reject`, `/flag`).
- **Current workaround:** Admin can PATCH the entry via `PATCH /api/participation-per-sport/{id}` to update counts, but there is no way to record approval/rejection state.
- **Frontend behavior until backend adds FSM:**
  - Show submissions in a read-only review table
  - Disable approve/reject/flag action buttons with tooltip "ត្រូវការ Backend ថ្មី"
  - Add a note in the UI: FSM pending teammate implementation
- **Flag to teammate:** We need `status` field on `ParticipationPerSportPublic` and dedicated transition endpoints.

### Backend Endpoints
| Step | Method | Path |
|------|--------|------|
| List submissions | `GET` | `/api/participation-per-sport/` |
| Get submission detail | `GET` | `/api/participation-per-sport/{id}` |
| Update (counts only — no status) | `PATCH` | `/api/participation-per-sport/{id}` |

### Loading / Empty / Error States
- Submissions list: skeleton → "មិនទាន់មានការដាក់ស្នើ" empty state → error
- Review detail: skeleton → error with back button

### Success Criterion (with backend gap workaround)
- Admin can view all submissions
- Admin can see per-sport counts submitted by each federation
- Action buttons visible but disabled with tooltip explaining backend gap

### Success Criterion (when backend adds FSM)
- Admin can approve → submission status shows "អនុម័ត"
- Admin can reject with reason → federation sees rejection reason
- Admin can flag → submission goes to flagged queue
- Transitions are irreversible except FLAGGED → can be reviewed again

### Failure Modes
| Failure | Handling |
|---------|---------|
| Backend returns 422 on PATCH | Show field-level error from RFC7807 |
| Network error | Show error toast + retry |

### i18n Namespaces
- `submissions.title`, `submissions.status.*` (pending, approved, rejected, flagged)
- `submissions.actions.*` (approve, reject, flag, reason)
- `submissions.reviewDetail.*`

---

## SCENARIO 07 — Federation Registers Participants (ALONE Mode)

**Actor:** Federation (`role = 'user1'`)  
**Module:** `registration-flow`  
**Week:** 5

### Preconditions
- Federation user is logged in; `auth.user.organization_id` is set
- An event exists with start_date set (needed for age computation)
- Cloudinary presign URL is available

### Steps
1. Federation navigates to **"ចុះឈ្មោះ"** (Register) → selects event → selects sport
2. Clicks **"បន្ថែមអ្នកចូលរួម"** (Add Participant)
3. Multi-step form:
   - **Step 1 — Personal Info:**
     - `kh_family_name`, `kh_given_name` (required, Khmer)
     - `en_family_name`, `en_given_name` (required, Latin)
     - `gender` (MALE / FEMALE from `genderEnum`)
     - `date_of_birth` (required — drives document rule)
     - `phone`, `address` (optional)
   - **Step 2 — Sport/Category:**
     - `sport_id` (from event's attached sports)
     - `category_id` (optional, from sport's categories)
     - `leader_role` (only if `role = 'leader'`)
   - **Step 3 — Documents (age-gated):**
     - Compute `age = computeAgeAtEvent(dob, event.start_date)` — **RED LINE #3**
     - `age < 18`: **birthCertificateUrl required** (photoUrl optional)
     - `age ≥ 18`: **nationalIdUrl OR passportUrl required** (photoUrl required)
     - Upload flow: `GET /api/cloudinary/presign-url` → upload to Cloudinary → get URL → store in form
   - **Step 4 — Review & Submit:**
     - Show summary of all fields
     - Submit → `POST /api/registration/` with JSON body inferred from `ParticipantUpdateRequest` shape:
       ```json
       {
         "kh_family_name": "...", "kh_given_name": "...",
         "en_family_name": "...", "en_given_name": "...",
         "gender": "MALE",
         "date_of_birth": "YYYY-MM-DD",
         "phone": "...", "address": "...",
         "photoUrl": "...",
         "birthCertificateUrl": "..." (if age < 18),
         "nationalIdUrl": "..." (if age ≥ 18),
         "passportUrl": "..." (alternative to nationalId if ≥ 18),
         "sport_id": N,
         "organization_id": N,
         "category_id": N,
         "role": "athlete"
       }
       ```

### RBAC Scoping
- `organization_id` in body must equal `auth.user.organization_id`
- Participant list query: `GET /api/registration/?role=athlete&organization_id={auth.user.organization_id}`
- Federation cannot see registrations from other organizations

### Age Rule (Red Line #3)
```ts
const age = computeAgeAtEvent(participant.date_of_birth, event.start_date);
// NOT: differenceInYears(new Date(), participant.date_of_birth)
```

### Document Rule
```ts
if (age < 18) {
  required: ['birthCertificateUrl']
  optional: ['photoUrl']
} else {
  required: ['photoUrl', 'nationalIdUrl OR passportUrl']
}
```

### Backend Endpoints
| Step | Method | Path |
|------|--------|------|
| Get event (for start_date) | `GET` | `/api/events/{event_id}` |
| List event sports | `GET` | `/api/events/{event_id}/sports` |
| List sport categories | `GET` | `/api/events/{event_id}/sports/{sport_id}/categories` |
| Get presign URL | `GET` | `/api/cloudinary/presign-url` |
| Register participant | `POST` | `/api/registration/` |
| List participants (for org) | `GET` | `/api/registration/?role=athlete&organization_id=N` |
| Get participant detail | `GET` | `/api/registration/{enroll_id}` |
| Update participant | `PATCH` | `/api/registration/update` |
| Delete participant | `DELETE` | `/api/registration/delete` |

### Loading / Empty / Error States
- Participants list: skeleton → "មិនទាន់មានអ្នកចូលរួម" empty state with CTA → error
- Upload progress: spinner on file input while uploading to Cloudinary
- Step indicator: `StepIndicator` component showing 4 steps

### Success Criterion
- Participant appears in list after submit
- Age rule enforced: under-18 without birth certificate cannot submit
- Over-18 without NID/passport cannot submit
- Organization scoping: federation can only see own participants

### Failure Modes
| Failure | Handling |
|---------|---------|
| Cloudinary upload fails | Show "ការផ្ទុកឯកសារបរាជ័យ" with retry on file input |
| Missing required document | Zod validation inline before step 3 advance |
| Backend 422 on submit | Map RFC7807 errors to form fields |
| Age computed incorrectly | If `event.start_date` is null, show warning and block submission |
| Duplicate registration (same person, same sport) | Show server error inline |

### i18n Namespaces
- `registration.steps.*` (personal, sport, documents, review)
- `registration.fields.*` (all field labels in Khmer)
- `registration.documents.*` (birthCert, nationalId, passport, photo)
- `registration.ageWarning`, `registration.documentRule.*`
- `registration.success`, `registration.error.*`

---

## SCENARIO 08 — Federation Registers Participants (TEAM Mode / Bulk)

**Actor:** Federation (`role = 'user1'`)  
**Module:** `registration-flow`  
**Week:** 5 (team mode added W7)

### Preconditions
- Same as Scenario 07
- Federation has a CSV/Excel roster prepared

### Steps
1. Federation opens registration → clicks **"ចុះឈ្មោះជាក្រុម"** (Register as Team)
2. Downloads CSV template (client-generated, no backend endpoint)
3. Fills template with multiple participants
4. Uploads CSV → frontend parses client-side
5. Table preview shows all rows with validation state (age-rule, document-rule per row)
6. Rows failing validation highlighted in red; user fixes before submit
7. Submit → loop `POST /api/registration/` for each valid row sequentially  
   _(No batch endpoint exists; use sequential calls with individual Idempotency-Keys)_
8. Progress bar shows N/M submissions complete
9. Any failed rows shown with error reason; user can retry individual rows

### ⚠️ Backend Gap
- No bulk registration endpoint. Frontend must loop individual `POST /api/registration/` calls.
- On network error mid-batch, already-submitted rows must not be resubmitted (Idempotency-Key per row, stored in session until confirmed).

### Backend Endpoints
Same as Scenario 07 (POST /api/registration/ called N times).

### Failure Modes
| Failure | Handling |
|---------|---------|
| CSV parse error | Show line-number errors in preview table |
| Age/document rule fails on row | Block that row; allow submitting valid rows |
| Partial batch failure | Show which rows succeeded, which failed; retry failed only |

### i18n Namespaces
- `registration.teamMode.*`, `registration.csvTemplate.*`, `registration.batchProgress.*`

---

## SCENARIO 09 — Organization Registers Organizers

**Actor:** Organization (`role = 'user2'`)  
**Module:** `participation` (organizer registration)  
**Week:** 5–6

### Preconditions
- Organization user is logged in; `auth.user.organization_id` is set
- An event exists
- RBAC: organization can only register organizers under their own `organization_id`

### Steps
1. Organization navigates to **"ចុះឈ្មោះអ្នករៀបចំ"** (Register Organizer)
2. Fills form:
   - Same personal info fields as Scenario 07
   - `role` = `'leader'` (from `RoleEnum`)
   - `leader_role` = one of `['coach', 'manager', 'delegate', 'team_lead', 'coach_trainer', 'teacher_assistant']` from `LeaderRole` enum
   - `sport_id`, `organization_id`, `category_id` (optional)
   - Documents: same age-based document rule applies (**Red Line #3 applies here too**)
3. Uploads photo + document → Cloudinary presign flow
4. Submits → `POST /api/registration/` with `role: 'leader'`
5. Success → organizer appears in list `GET /api/registration/?role=leader&organization_id=N`

### RBAC Scoping
- `GET /api/registration/?role=leader&organization_id={auth.user.organization_id}`
- `role` query param is **required** (validated by backend)
- `organization_id` query param scopes to this organization's organizers

### Backend Endpoints
| Step | Method | Path |
|------|--------|------|
| Get presign URL | `GET` | `/api/cloudinary/presign-url` |
| Register organizer | `POST` | `/api/registration/` |
| List organizers | `GET` | `/api/registration/?role=leader&organization_id=N` |
| Update organizer | `PATCH` | `/api/registration/update` |
| Delete organizer | `DELETE` | `/api/registration/delete` |

### Loading / Empty / Error States
- Organizer list: skeleton → "មិនទាន់មានអ្នករៀបចំ" empty state with CTA → error

### Success Criterion
- Organizer appears in list filtered by `role=leader` + `organization_id`
- `leader_role` badge shown (Coach / Manager / Delegate / etc.)
- Age/document rules enforced identically to participant registration
- Organization cannot see organizers from other organizations

### Failure Modes
Same as Scenario 07, plus:
| Failure | Handling |
|---------|---------|
| Invalid `leader_role` value | Zod enum validation inline |
| Missing `role=leader` in query | Ensure hook always passes `role` param |

### i18n Namespaces
- `participation.leaderRoles.*` (coach, manager, delegate, team_lead, coach_trainer, teacher_assistant)
- `participation.form.*`, `participation.list.*`
- `participation.success`, `participation.error.*`

---

## SCENARIO 10 — Admin Generates Khmer Reports

**Actor:** Admin (`role = 'admin'`)  
**Module:** `reports`  
**Week:** 6–7

### Preconditions
- Admin is logged in
- At least one event has registered participants
- `org_id` and `event_id` are known

### Steps
1. Admin navigates to **"របាយការណ៍"** (Reports)
2. Selects event and organization from dropdowns
3. Selects report type from the 8 report options
4. Clicks **"ទាញយករបាយការណ៍"** (Generate Report)
5. Downloads Excel file

### ⚠️ Critical Backend Gap — Only 2 of 8 Reports Exist

| Report | Status | Backend Endpoint |
|--------|--------|-----------------|
| RPT-SPORT-LIST (ចុះប្រភេទកីឡា) | ⚠️ **MISSING** | No endpoint |
| RPT-DELEGATION (តារាងទិន្នន័យក្រុម) | ⚠️ **MISSING** | No endpoint |
| RPT-NUMBER-LIST (បញ្ជីចំនួន) | ⚠️ **MISSING** | No endpoint |
| RPT-ALBUM (អាល់ប៊ុមប្រតិភូ) | ⚠️ **MISSING** | No endpoint |
| RPT-ROSTER-ALL (បញ្ជីរាយនាមរួម) | ✅ **EXISTS** | `GET /api/excel/org-sport` |
| RPT-LEADER-ALL (បញ្ជីថ្នាក់ដឹកនាំ) | ⚠️ **MISSING** | No endpoint |
| RPT-COACH-ATHLETE (គ្រូបង្វឹក + កីឡាករ) | ⚠️ **MISSING** | No endpoint |
| RPT-DELEGATION-LEADERS (ប្រតិភូ + អ្នកដឹកនាំ) | ⚠️ **MISSING** | No endpoint |

_Note: `GET /api/excel/org-sport-participant` returns counts per org+sport and may map to RPT-NUMBER-LIST._

### Backend Endpoints (existing)
| Step | Method | Path |
|------|--------|------|
| RPT-ROSTER-ALL (full detail) | `GET` | `/api/excel/org-sport` |
| RPT-NUMBER-LIST (counts) | `GET` | `/api/excel/org-sport-participant` |
| List events (for picker) | `GET` | `/api/events/` |
| List orgs (for picker) | `GET` | `/api/organization/` |

### Query Parameters (to confirm with teammate)
Both Excel endpoints need `org_id` and `event_id` — confirm exact param names before implementing.

### Loading / Empty / Error States
- Report list page: skeleton → "មិនទាន់មានរបាយការណ៍" → error
- Missing-backend reports: show "ត្រូវការ Backend — មិនទាន់ត្រៀម" badge per report row
- Download in progress: spinner → toast on success/failure

### Success Criterion
- RPT-ROSTER-ALL: Excel downloads with correct Khmer column headers
- RPT-NUMBER-LIST: Excel downloads with participant counts per sport
- Khmer text renders correctly in Excel (UTF-8 BOM if needed for Windows)
- Missing reports: clearly communicated to admin as "coming soon"

### Failure Modes
| Failure | Handling |
|---------|---------|
| Report endpoint missing | Show "ត្រូវការ Backend" label; disable download button |
| Empty event/org selection | Disable generate button until both selected |
| Download fails | Toast error + retry |
| Khmer rendering broken | Use UTF-8 BOM; surface as known issue |

### i18n Namespaces
- `reports.title`, `reports.types.*` (all 8 report names in Khmer)
- `reports.generate`, `reports.download`, `reports.loading`, `reports.empty`
- `reports.backendGap` — message for missing reports

---

## Cards (bonus, Week 8)

**Actor:** Admin or Federation  
**Module:** `cards`  
**Week:** 8

Card generation uses:
- `GET /api/cards/{org_id}/{event_id}` — paginated list
- `GET /api/card/{p_id}/{org_id}/{event_id}` — single card

Cards display: `name`, `gender`, `sport`, `role`, `org_name`, `card_type`, `profile_image`.

No separate scenario written — this is MVP-only scope in Week 8.

---

## Backend Gap Summary (for teammate coordination)

| # | Gap | Impact | Scenario(s) |
|---|-----|--------|-------------|
| 1 | No `status` field on `EventPublic` / no publish endpoint | Admin cannot formally publish events | 01 |
| 2 | No quota field on `SportsEventPublic` | Per-sport quotas cannot be stored | 01 |
| 3 | No survey status / FSM (approve/reject/flag) | Admin cannot review surveys formally | 06 |
| 4 | `ParticipationPerSportCreate` lacks `category_id` | By-category survey cannot store breakdown | 05 |
| 5 | `GET /api/participation-per-sport/` lacks event/org filter params | Frontend must filter client-side | 02, 03, 06 |
| 6 | No batch registration endpoint | Team mode uses N sequential POSTs | 08 |
| 7 | 6 of 8 Khmer report endpoints missing | Only 2 reports downloadable at W6 | 10 |
| 8 | `POST /api/registration/` body schema undocumented | Inferred from `ParticipantUpdateRequest`; needs confirmation | 07, 08, 09 |
| 9 | `federation_id` scoping absent on most list endpoints | Client-side scoping by `organization_id` used as fallback | 03, 06, 07 |

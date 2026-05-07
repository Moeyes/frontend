# User Scenarios — Canonical Spec

Every module rebuild references this file. Scenarios are numbered 01–10 matching the master plan.

**Cross-cutting rules embedded in every scenario:**
- All strings displayed via `t('key')` — no hardcoded strings in JSX
- Age is computed from the **event date**, not today's date
- Document type rule: birth certificate if age < 18 at event date; NID or passport if ≥ 18
- All mutations send `Idempotency-Key` header (uuid v4)
- FSM transitions are server-side only — client never mutates status locally
- Every list shows: loading skeleton → empty state → error state with retry
- RBAC: Federation/Org users see only their own scoped data (org_id from auth context)
- Tokens stored in HttpOnly cookies — never localStorage

---

## Scenario 01 — Admin creates an event with sports and quotas

**Actor:** Admin (or Super Admin)

**Precondition:**
- User is logged in with Admin or Super Admin role
- At least one sport exists in the system

**Steps:**
1. Navigate to `/events` — sees event list (empty state if none)
2. Click "Create Event" button
3. Fill form: name (Khmer), type (dropdown from `eventType` enum), description, start date, end date, location, open/close registration dates
4. Submit → optimistic add to list → POST `/api/events/`
5. On success: redirect to `/events/{event_id}` (event detail page)
6. On event detail: click "Add Sport" → select from sport list → POST `/api/events/add-sport`
7. For each sport: set per-sport quota (athlete count M/F, leader count M/F) — this maps to the participation-per-sport headcount system
8. Optionally: link specific organizations to specific sports via POST `/api/events/add-org-to-sport`
9. Admin reviews the event summary and considers it "published" (no publish FSM on backend — status is implicit)

**Backend endpoints:**
- `POST /api/events/` — create event
- `GET /api/events/` — list events
- `GET /api/events/{event_id}` — get event detail
- `PATCH /api/events/{event_id}` — edit event fields
- `GET /api/sports/` — populate sport picker
- `POST /api/events/add-sport` — attach sport to event
- `DELETE /api/events/remove-sport-from-event` — remove sport from event
- `POST /api/events/add-org-to-sport` — link org to event+sport
- `DELETE /api/events/delete-event-sport-org-link` — remove specific org-sport link
- `DELETE /api/events/remove-org-completely-from-event` — remove org from all sports in event
- `GET /api/events/{event_id}/sports` — list sports attached to event
- `GET /api/events/{event_id}/sports/{sport_id}/orgs` — list orgs for a sport in event
- `GET /api/organization/` — populate org picker

**States required:**
- Event list: loading skeleton (3 rows), empty ("មិនទាន់មានព្រឹត្តិការណ៍"), error with retry
- Event detail: loading skeleton for sport list section
- Sport picker modal: loading spinner, empty if no sports exist
- Add org modal: loading spinner, empty if no orgs

**Success criterion:**
- Event appears in list with correct name and type
- Sports are listed on the event detail page
- Orgs appear under each sport

**Failure modes:**
- `name_kh` already taken → show inline validation error
- Invalid date range (end before start) → Zod client-side validation before submit
- Network error during POST → toast error, keep form open, allow retry
- Sport already attached → show inline error from backend

**i18n keys (sketch):**
```
events.create.title, events.create.name_kh, events.create.type, events.create.description,
events.create.start_date, events.create.end_date, events.create.location,
events.create.open_register, events.create.close_register, events.create.submit,
events.detail.sports_section, events.detail.add_sport, events.detail.add_org,
events.list.empty, events.list.title, events.error.create_failed,
events.type.national, events.type.secondary, events.type.middle, events.type.primary
```

---

## Scenario 02 — Admin sends a survey to federations

**Actor:** Admin (or Super Admin)

**Precondition:**
- Event exists
- Federations (organizations of type `province` or `ministry`) exist in the system
- Sports are attached to the event

**Steps:**
1. Navigate to `/events/{event_id}/surveys` (or survey management page)
2. Click "Send Survey"
3. Select survey type: by-sport | by-number | by-category
4. Select target federations (multi-select from org list)
5. Confirm and send → creates survey record(s) in DRAFT/SENT state

> ⚠️ **Backend gap:** No survey-send endpoint exists. `participation-per-sport` handles headcount submissions but there is no "send survey to federation" operation. This scenario's admin-initiation step may require a new backend endpoint. For now, treat "sending" as the admin creating a participation-per-sport record on behalf of a federation (pre-populating it), or the federation self-submitting without a formal survey send.

**Backend endpoints (available):**
- `GET /api/events/{event_id}/sports` — sports in event
- `GET /api/organization/` — list federations
- `POST /api/participation-per-sport/` — create headcount record (closest available)

**Backend endpoints (MISSING — gap for teammate):**
- `POST /api/surveys/send` — send survey to federation(s) with type and target orgs
- `GET /api/surveys/` — list sent surveys with status

**States required:**
- Federation picker: loading, empty, error
- Survey type selector: required — show error if not selected

**Success criterion:**
- Federations receive a survey task (visible in their dashboard)

**Failure modes:**
- No federations selected → inline validation
- Backend error → toast with retry

**i18n keys (sketch):**
```
survey.send.title, survey.send.type, survey.send.targets, survey.send.confirm,
survey.type.by_sport, survey.type.by_number, survey.type.by_category,
survey.send.success, survey.send.error
```

---

## Scenario 03 — Federation submits a by-sport survey response

**Actor:** Federation (province/ministry org)

**Precondition:**
- Admin has sent a by-sport survey (or survey system allows self-submission)
- Federation user is logged in; `organization_id` available in auth context
- Event is in registration-open state

**Steps:**
1. Navigate to `/surveys` (federation view) — sees pending surveys
2. Click on the by-sport survey for the event
3. For each sport in the event: enter athlete count (M / F) and leader count (M / F)
4. Review totals
5. Submit → POST `/api/participation-per-sport/` once per sport line
6. Status transitions to SUBMITTED (if FSM exists on backend)

> ⚠️ **Backend gap:** There is no survey FSM. `participation-per-sport` accepts the headcount but has no `status` field. Submission does not trigger an admin review queue. Frontend should treat a successful POST as "submitted" visually, but the approval workflow UI will need to wait for backend implementation.

**Backend endpoints:**
- `GET /api/events/` — list events for federation
- `GET /api/events/{event_id}/sports` — sports to fill out
- `POST /api/participation-per-sport/` — submit headcount per sport
- `GET /api/participation-per-sport/` — list existing submissions (to prefill form if editing)
- `PATCH /api/participation-per-sport/{id}` — edit existing submission

**States required:**
- Sport list: loading skeleton, empty ("មិនទាន់មានកីឡា"), error
- Per-sport rows: inline validation for negative numbers, required fields
- Submit: disabled while pending, spinner in button

**Success criterion:**
- Each sport row saves successfully
- Federation sees a "submitted" confirmation

**Failure modes:**
- Org not linked to sport in event → show which sports are not available to them
- Submission already exists → PATCH instead of POST (detect on 409 or by pre-fetching)
- Partial failure (some sports saved, some not) → show per-row status

**i18n keys (sketch):**
```
survey.by_sport.title, survey.by_sport.sport_col, survey.by_sport.athlete_m,
survey.by_sport.athlete_f, survey.by_sport.leader_m, survey.by_sport.leader_f,
survey.by_sport.total, survey.by_sport.submit, survey.by_sport.success
```

---

## Scenario 04 — Federation submits a by-number survey response

**Actor:** Federation

**Precondition:** Same as Scenario 03, but survey type is by-number (total headcount only, not per sport)

**Steps:**
1. Navigate to pending survey (by-number type)
2. Enter total athlete count (M / F) and total leader count (M / F) — single set of fields
3. Submit → POST `/api/participation-per-sport/` with a single aggregate record

> ⚠️ **Backend gap:** by-number vs by-sport vs by-category distinction is not modeled on the backend. The `participation-per-sport` endpoint exists but all three survey types would use the same endpoint with different data shapes. Frontend must handle the UI difference; backend stores it the same way.

**Backend endpoints:** Same as Scenario 03

**States required:** Same as Scenario 03 (simpler form — single row)

**Success criterion:** Single headcount record saved; federation sees confirmation

**Failure modes:** Same as Scenario 03

**i18n keys (sketch):**
```
survey.by_number.title, survey.by_number.total_athletes, survey.by_number.total_leaders,
survey.by_number.athlete_m, survey.by_number.athlete_f, survey.by_number.submit
```

---

## Scenario 05 — Federation submits a by-category survey response

**Actor:** Federation

**Precondition:** Same as Scenario 03, but survey type is by-category (M/F × age band per sport category)

**Steps:**
1. Navigate to pending survey (by-category type)
2. For each sport category in the event (from `GET /api/events/{event_id}/sports/{sport_id}/categories`):
   - Enter male count and female count for this category
3. Submit per-category → POST `/api/participation-per-sport/` once per category row

> ⚠️ **Backend gap:** `participation-per-sport` does not have a `category_id` field — it only has aggregate counts. By-category breakdown cannot be stored with the current schema. This scenario requires a backend schema change. Frontend should display the form; submission will be approximate until backend supports it.

**Backend endpoints:**
- `GET /api/events/{event_id}/sports/{sport_id}/categories` — get categories
- `POST /api/participation-per-sport/` — best available (no category field)

**Missing backend:**
- Category-level count storage field on participation-per-sport or a new endpoint

**States required:**
- Category list: loading, empty, error
- Per-category inputs: required, non-negative integers

**Success criterion:** All category rows submitted; federation sees confirmation

**i18n keys (sketch):**
```
survey.by_category.title, survey.by_category.category_col, survey.by_category.male_count,
survey.by_category.female_count, survey.by_category.submit
```

---

## Scenario 06 — Admin reviews surveys (approve / reject / flag)

**Actor:** Admin (or Super Admin)

**Precondition:** Federations have submitted survey responses (participation-per-sport records exist)

**Steps:**
1. Navigate to `/submissions` — admin sees list of all survey submissions
2. Filter by event, status, federation
3. Click a submission → see detail view with submitted headcounts
4. Choose action: Approve | Reject (with revision note) | Flag
5. Confirm → PATCH submission status (FSM transition)

> ⚠️ **Backend gap:** No FSM on `participation-per-sport`. No status field, no approve/reject endpoints. This entire scenario requires backend implementation. Frontend should build the UI against the anticipated API shape so it can be wired in when backend is ready.

**Anticipated backend endpoints (MISSING):**
- `GET /api/participation-per-sport/?status=SUBMITTED&event_id=X` — filter by status
- `PATCH /api/participation-per-sport/{id}/approve` — approve
- `PATCH /api/participation-per-sport/{id}/reject` — reject with reason
- `PATCH /api/participation-per-sport/{id}/flag` — flag for follow-up

**Available backend:**
- `GET /api/participation-per-sport/` — list all (no status filter documented)
- `PATCH /api/participation-per-sport/{id}` — update fields (can be used as workaround)

**States required:**
- Submission list: loading, empty, error; filter controls
- Submission detail: loading, error
- FSM status badge: color-coded (DRAFT=gray, SUBMITTED=blue, APPROVED=green, REJECTED=red, FLAGGED=yellow, REVISION_REQUESTED=orange)
- Action buttons: disabled while pending

**Success criterion:**
- Submission status updates in list immediately (optimistic)
- Admin can see reason text for rejected submissions

**Failure modes:**
- Transition not allowed by FSM → show "invalid transition" error from backend
- Network error → rollback optimistic update, show toast

**i18n keys (sketch):**
```
submissions.title, submissions.filter.status, submissions.filter.event,
submissions.detail.title, submissions.action.approve, submissions.action.reject,
submissions.action.flag, submissions.action.revision,
submissions.status.draft, submissions.status.submitted, submissions.status.approved,
submissions.status.rejected, submissions.status.flagged, submissions.status.revision_requested,
submissions.reject.reason_placeholder
```

---

## Scenario 07 — Federation registers participants (ALONE mode)

**Actor:** Federation user

**Precondition:**
- Event is in registration-open period (`open_register_date` ≤ today ≤ `close_register_date`)
- Federation is linked to sports in the event
- `organization_id` in auth context

**Steps:**
1. Navigate to `/register` — sees registration dashboard (by-sport quota progress)
2. Click "Add Participant" → select sport → select category (if athlete)
3. Fill participant form:
   - Khmer name (family, given), Latin name (family, given)
   - Gender (MALE / FEMALE)
   - Date of birth
   - Role: Athlete | Leader
   - If Athlete: select category from sport's categories
   - If Leader: select leaderRole (coach / asst-coach / staff)
   - Phone
   - ID doc type (auto-suggested based on age from event date: birth cert if <18, NID/passport if ≥18)
   - Upload photo → GET `/api/cloudinary/presign-url` → upload direct to Cloudinary → store URL
   - Upload ID document → same Cloudinary flow
4. Submit → POST `/api/registration/`
5. Participant appears in list with status

**Backend endpoints:**
- `GET /api/events/{event_id}/sports` — sports for this event
- `GET /api/events/{event_id}/sports/{sport_id}/categories` — categories for sport
- `GET /api/cloudinary/presign-url` — get upload credentials
- `POST /api/registration/` — create participant record
- `GET /api/registration/` — list participants (filtered by org_id from auth)
- `GET /api/registration/{enroll_id}` — participant detail

**Age / document rule (critical):**
```
age = event.start_date - participant.dateOfBirth (in years)
if age < 18: idDocType options = ["BirthCertificate"]
else: idDocType options = ["IDCard", "Passport"]
```

**States required:**
- Registration list: loading, empty ("មិនទាន់មានអ្នកចុះឈ្មោះ"), error
- Form steps: multi-step indicator (personal info → role/sport → documents → review)
- Photo upload: progress indicator
- Submit: disabled while uploading or pending

**Success criterion:**
- Participant appears in list with correct name, sport, role
- Quota counter decrements (if quota tracking is in UI)

**Failure modes:**
- Quota exceeded → backend 400, show "quota full" error
- Document upload fails → keep form open, show upload error per field
- Required fields missing → Zod inline validation before submit
- Network error → keep form, allow retry

**i18n keys (sketch):**
```
registration.title, registration.add_participant, registration.form.kh_family_name,
registration.form.kh_given_name, registration.form.en_family_name, registration.form.en_given_name,
registration.form.gender, registration.form.dob, registration.form.role,
registration.form.sport, registration.form.category, registration.form.leader_role,
registration.form.phone, registration.form.id_doc_type, registration.form.photo,
registration.form.id_doc, registration.doc_type.birth_cert, registration.doc_type.nid,
registration.doc_type.passport, registration.submit, registration.success,
registration.error.quota_exceeded, registration.list.empty
```

---

## Scenario 08 — Federation registers participants (TEAM mode / bulk)

**Actor:** Federation user

**Precondition:** Same as Scenario 07

**Steps:**
1. On registration page, switch to "Team Mode" tab
2. Select sport → select category (if athletes)
3. Add multiple participants in a table UI — each row = one participant
4. For each row: name fields, gender, DOB, role, doc type
5. Documents uploaded per participant (same Cloudinary flow)
6. Submit all → POST `/api/registration/` called once per participant (parallel or sequential)
7. Show per-row success/failure status

**Backend endpoints:** Same as Scenario 07

**States required:**
- Table rows: add/remove row controls
- Per-row inline validation
- Batch submit: progress ("3 of 10 submitted"), partial failure handling

**Success criterion:**
- All valid rows submitted; failed rows remain editable with error message

**Failure modes:**
- Row-level errors (quota, validation) shown inline per row
- Network error → retry failed rows individually

**i18n keys (sketch):**
```
registration.team_mode.title, registration.team_mode.add_row, registration.team_mode.remove_row,
registration.team_mode.submit_all, registration.team_mode.progress,
registration.team_mode.row_error, registration.team_mode.row_success
```

---

## Scenario 09 — Organization registers organizers

**Actor:** Organization user (province/ministry org — distinct from federation in context)

**Precondition:**
- Organization is linked to an event
- `organization_id` in auth context

**Steps:**
1. Navigate to `/participation` — sees organizer registration dashboard
2. Click "Add Organizer"
3. Fill form:
   - Khmer name, Latin name, gender, DOB, phone
   - Role: leader | coach | asst-coach | staff  (maps to `leaderRole` in registration endpoint)
   - Sport (if applicable)
   - Upload photo (Cloudinary flow)
   - Upload ID document
4. Submit → POST `/api/registration/` with `role: "leader"` and `leaderRole: <selected>`
5. Organizer appears in list

> **Note:** The backend `registration` endpoint handles both athletes and organizers via the `role` field. Athletes use `role: "Athlete"`, organizers use `role: "leader"` with a `leaderRole` sub-field. The frontend should present these as separate flows (Scenario 07/08 vs Scenario 09) even though they hit the same endpoint.

**Backend endpoints:**
- `GET /api/cloudinary/presign-url`
- `POST /api/registration/` (with `role: "leader"`, `leaderRole: "coach"|"staff"|...`)
- `GET /api/registration/` (filtered by org_id)
- `PATCH /api/registration/update`
- `DELETE /api/registration/delete`

**States required:**
- Organizer list: loading, empty, error
- Form: same doc-type age rule applies
- Submit: disabled while pending

**Success criterion:** Organizer appears in list with correct role label

**Failure modes:** Same as Scenario 07

**i18n keys (sketch):**
```
participation.title, participation.add_organizer, participation.form.role,
participation.role.leader, participation.role.coach, participation.role.asst_coach,
participation.role.staff, participation.list.empty, participation.success
```

---

## Scenario 10 — Admin generates the 8 Khmer reports

**Actor:** Admin (or Super Admin)

**Precondition:**
- Event has participants registered and surveys approved
- User is logged in as Admin

**Steps:**
1. Navigate to `/reports`
2. Select event from dropdown
3. See list of 8 report types, each with a "Generate" button
4. Click "Generate" for a report type → call report endpoint → backend generates file
5. When ready: "Download" button appears → click → follows signed URL to download file
6. (If async generation): show spinner/progress while generating, poll or SSE for completion

> ⚠️ **Backend gap:** Only 2 report endpoints exist (`/api/excel/org-sport` and `/api/excel/org-sport-participant`). 6 of 8 planned Khmer reports are missing. Frontend should build the full 8-report UI; wire available endpoints; show "Coming Soon" or disabled state for missing ones.

**Available backend:**
- `GET /api/excel/org-sport` → RPT-COACH-ATHLETE (closest match: org+sport+participant data)
- `GET /api/excel/org-sport-participant` → RPT-NUMBER-LIST (closest match: participant counts)

**Missing backend (6 reports):**
- RPT-SPORT-LIST — ចុះប្រភេទកីឡា
- RPT-DELEGATION — តារាងទិន្នន័យក្រុមចូលរួមកីឡា
- RPT-ALBUM — អាល់ប៊ុមប្រតិភូ
- RPT-ROSTER-ALL — បញ្ជីរាយនាមរួម
- RPT-LEADER-ALL — បញ្ជីថ្នាក់ដឹកនាំ
- RPT-DELEGATION-LEADERS — បញ្ជីប្រតិភូ និងអ្នកដឹកនាំក្រុម

**States required:**
- Report list: always visible (not gated on loading)
- Per report: idle → generating (spinner) → ready (download button) → error (retry)
- Event selector: loading, empty, error

**Success criterion:**
- Available reports download successfully as Excel/PDF files
- Unavailable reports show clear "not yet available" state

**Failure modes:**
- Backend error during generation → show error per report card with retry
- Signed URL expired → re-trigger generation

**i18n keys (sketch):**
```
reports.title, reports.select_event, reports.generate, reports.download,
reports.generating, reports.ready, reports.error, reports.not_available,
reports.rpt_sport_list, reports.rpt_delegation, reports.rpt_number_list,
reports.rpt_album, reports.rpt_roster_all, reports.rpt_leader_all,
reports.rpt_coach_athlete, reports.rpt_delegation_leaders
```

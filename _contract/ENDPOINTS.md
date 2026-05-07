# Backend Endpoints Reference

Auto-generated from `openapi.json` fetched from `http://localhost:8000/api/openapi.json`.

**Note on auth:** All endpoints in the OpenAPI spec are marked as "public" (no `securitySchemes` defined on operations). In practice the backend uses JWT Bearer tokens via middleware. The frontend must send `Authorization: Bearer <access_token>` on all non-login requests. Roles listed below are inferred from business logic in the master plan, not from the OpenAPI spec — the teammate has not decorated endpoints with role requirements yet.

Format: `METHOD path → req body → response shape → inferred role(s)`

---

## AUTH

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| POST | `/api/auth/login` | `{username*, password*}` | `{access_token*, refresh_token*, token_type}` | public |
| POST | `/api/auth/refresh` | none (uses refresh token cookie/header) | `{access_token*, refresh_token*, token_type}` | public |
| GET | `/api/auth/session/{user_id}` | — | `UserPublic{id, kh_family_name, kh_given_name, en_family_name, en_given_name, email, username, role}` | authenticated |

---

## DASHBOARD

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/dashboard` | — | `DashboardResponse{success, data{stats, events[], sports[], topOrganizations[], recentEnrollments[], genderDistribution}}` | Admin, Super Admin |

---

## EVENTS

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| POST | `/api/events/` | `EventCreate{name_kh*, type*(eventType enum), description?, start_date?, end_date?, location?, open_register_date?, close_register_date?}` | `EventPublic` | Admin, Super Admin |
| GET | `/api/events/` | — | `EventsPublic{data[EventPublic], count}` | Admin, Super Admin |
| GET | `/api/events/{event_id}` | — | `EventPublic{id, name_kh, type, description, start_date, end_date, location, open_register_date, close_register_date}` | All authenticated |
| PATCH | `/api/events/{event_id}` | `EventUpdate{name_kh?, type?, description?, start_date?, end_date?, location?, open_register_date?, close_register_date?}` | `EventPublic` | Admin, Super Admin |
| DELETE | `/api/events/delete` | `{event_id*}` | 204 | Admin, Super Admin |
| POST | `/api/events/add-sport` | `{events_id?, sports_id?}` | `SportsEventPublic{id, event_name, sport_name, created_at}` | Admin, Super Admin |
| DELETE | `/api/events/remove-sport-from-event` | `{association_id*}` | 204 | Admin, Super Admin |
| POST | `/api/events/add-org-to-sport` | `{events_id*, sports_id*, org_id*}` | `SportsEventOrgPublic{id, events_id, sports_id, organization_id, created_at}` | Admin, Super Admin |
| DELETE | `/api/events/delete-event-sport-org-link` | `{association_id*}` | 204 | Admin, Super Admin |
| DELETE | `/api/events/remove-org-completely-from-event` | `{event_id*, org_id*}` | 204 | Admin, Super Admin |
| GET | `/api/events/{event_id}/sports` | — | `[SportsEventPublic]` | All authenticated |
| GET | `/api/events/{event_id}/organizations` | — | `[EventOrgNamesPublic{organization_id, organization_name}]` | All authenticated |
| GET | `/api/events/{event_id}/sports/{sport_id}/orgs` | — | `[SportEventOrgOnly{id, organization_id, organization_name, created_at}]` | All authenticated |
| GET | `/api/events/{event_id}/sports/{sport_id}/categories` | — | `[CategoryPublic{id, sport_name, category, gender, created_at}]` | All authenticated |

**eventType enum values (Khmer strings):**
- កីឡាជាតិ
- កីឡាអ៊ុតស្មើនិងមធ្យមសិក្សាបន្ថែកជាតិថ្នាក់ជាតិ
- សិស្សមធ្យមសិក្សា​ថ្នាក់ជាតិ
- កីឡាសិស្សបឋមសិក្សាជាតិ

---

## SPORTS

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/sports/` | — | `SportsPublic{data[SportPublic], count}` | All authenticated |
| POST | `/api/sports/` | `{name_kh*, sport_type*}` | `SportPublic{id, name_kh, sport_type, created_at}` | Admin, Super Admin |
| GET | `/api/sports/{sport_id}` | — | `SportPublic` | All authenticated |
| POST | `/api/sports/category` | `{sport_id*, event_id*, category_name*, gender*(MALE\|FEMALE)}` | `CategoryPublic{id, sport_name, category, gender, created_at}` | Admin, Super Admin |
| PATCH | `/api/sports/category` | `{category_id*, category_name*}` | `CategoryPublic` | Admin, Super Admin |
| DELETE | `/api/sports/category` | `{category_id*}` | 204 | Admin, Super Admin |
| GET | `/api/sports/category/{category_id}` | — | `CategoryPublic` | All authenticated |

---

## ORGANIZATION

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/organization/` | — | `OrganizationsPublic{data[OrganizationPublic], count}` | Admin, Super Admin |
| POST | `/api/organization/` | `{name_kh*, type*(province\|ministry), code?}` | `OrganizationPublic{id, name_kh, type, code, created_at}` | Admin, Super Admin |
| GET | `/api/organization/{org_id}` | — | `OrganizationPublic` | All authenticated |
| PATCH | `/api/organization/update` | `{org_id*, data{name_kh?, type?, code?}}` | `OrganizationPublic` | Admin, Super Admin |
| DELETE | `/api/organization/delete` | `{org_id*}` | 204 | Admin, Super Admin |

---

## USERS

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/users/` | — | `UsersPublic{data[UserPublic], count}` | Admin, Super Admin |
| POST | `/api/users/` | `{kh_family_name*, kh_given_name*, en_family_name*, en_given_name*, email*, username*, role?, photo_path?}` | `UserPublic{id, kh_family_name, kh_given_name, en_family_name, en_given_name, email, username, role}` | Admin, Super Admin |
| GET | `/api/users/{user_id}` | — | `UserPublic` | Admin, Super Admin |
| PATCH | `/api/users/update` | `{user_id*, data{kh_family_name?, kh_given_name?, en_family_name?, en_given_name?, email?, username?, role?, photo_path?}}` | `UserPublic` | Admin, Super Admin |
| DELETE | `/api/users/delete` | `{user_id*}` | `{message}` | Admin, Super Admin |

---

## PARTICIPATION-PER-SPORT

> Appears to serve as the **survey headcount submission** feature. Federations/organizations submit participant counts per sport per event.

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/participation-per-sport/` | — | `ParticipationPerSportPublicList{data[], count}` | Admin, Federation, Organization |
| POST | `/api/participation-per-sport/` | `{org_id*, events_id*, sports_id*, organization_id*, athlete_female_count?, leader_female_count?, athlete_male_count?, leader_male_count?}` | `ParticipationPerSportPublic{id, org_id, org_name, event_name, sports_Events_id, athlete_female_count, leader_female_count, athlete_male_count, leader_male_count}` | Federation, Organization |
| GET | `/api/participation-per-sport/{id}` | — | `ParticipationPerSportPublic` | Admin, Federation, Organization |
| PATCH | `/api/participation-per-sport/{id}` | `{org_id?, events_id?, sports_id?, organization_id?, athlete_female_count?, leader_female_count?, athlete_male_count?, leader_male_count?}` | `ParticipationPerSportPublic` | Federation, Organization |
| DELETE | `/api/participation-per-sport/{id}` | — | `ParticipationPerSportPublic` | Admin, Super Admin |

---

## REGISTRATION

> Handles participant registration (athletes and leaders) for events. Request body is a flexible object — schema inferred from provided examples.

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/registration/` | — | `[ParticipantPublic]` | Admin, Federation, Organization |
| POST | `/api/registration/` | See athlete/leader examples below | `ParticipantPublic` | Federation, Organization |
| GET | `/api/registration/{enroll_id}` | — | `ParticipantPublic` | Admin, Federation, Organization |
| PATCH | `/api/registration/update` | `{enroll_id*, role*(athlete\|leader), data{kh_family_name?, kh_given_name?, ...}}` | `ParticipantPublic` | Federation, Organization |
| DELETE | `/api/registration/delete` | `{enroll_id*}` | 204 | Admin, Federation, Organization |

**Athlete registration payload:**
```json
{
  "eventId": 11, "organizationId": 5, "sportId": 1, "categoryId": 22,
  "lastNameKhmer": "...", "firstNameKhmer": "...", "lastNameLatin": "Sok", "firstNameLatin": "Sabbay",
  "gender": "Male", "dateOfBirth": "2005-05-20", "phone": "012345678",
  "idDocType": "IDCard",
  "photoUrl": "...", "nationalityDocumentUrl": "...", "birthCertificateUrl": "...",
  "nationalIdUrl": "...", "passportUrl": "...",
  "role": "Athlete"
}
```

**Leader/Coach registration payload:**
```json
{
  "eventId": 11, "organizationId": 5, "sportId": 1,
  "lastNameKhmer": "...", "firstNameKhmer": "...", "lastNameLatin": "Chan", "firstNameLatin": "Dara",
  "gender": "Male", "dateOfBirth": "1985-10-15", "phone": "099888777",
  "idDocType": "Passport",
  "photoUrl": "...", "nationalityDocumentUrl": "...", "birthCertificateUrl": "...",
  "nationalIdUrl": "...", "passportUrl": "...",
  "role": "leader", "leaderRole": "coach"
}
```

---

## CARD

> Out of scope for the main sprint. Lowest priority.

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/card/{p_id}/{org_id}/{event_id}` | — | `CardResponse{id, name, gender, sport, role, org_name, card_type, profile_image}` | Admin, Federation |
| GET | `/api/cards/{org_id}/{event_id}` | — | `PaginatedCardsResponse{cards[], total}` | Admin, Federation |

---

## EXCEL (Reports)

> These appear to be the report-generation endpoints, though only 2 of the 8 planned Khmer reports are present.

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/excel/org-sport` | query params TBD | `OrgSportParticipantFullResponse{org_name, event_name, data[]}` | Admin, Super Admin |
| GET | `/api/excel/org-sport-participant` | query params TBD | `OrgSportParticipantExcelResponse{org_name, event_name, data[]}` | Admin, Super Admin |

---

## CLOUDINARY

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/cloudinary/presign-url` | — | `PresignUrlResponse{signature, timestamp, folder, public_id, cloud_name, api_key}` | authenticated |

---

## MAINTENANCE (Dev-only)

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| POST | `/api/maintenance/drop` | — | — | Super Admin (dev only) |
| POST | `/api/maintenance/sync-schema` | — | — | Super Admin (dev only) |

---

## ROOT

| Method | Path | Request | Response | Roles |
|--------|------|---------|----------|-------|
| GET | `/api/root/` | — | — | public (health check) |

---

## Summary

### Endpoint domains found (12)
1. **auth** — 3 endpoints
2. **dashboard** — 1 endpoint
3. **events** — 14 endpoints
4. **sports** — 7 endpoints
5. **organization** — 5 endpoints
6. **users** — 5 endpoints
7. **participation-per-sport** — 5 endpoints (likely the survey/headcount module)
8. **registration** — 5 endpoints (participant registration: athletes + leaders)
9. **card** — 2 endpoints (out of scope)
10. **excel** — 2 endpoints (partial reports)
11. **cloudinary** — 1 endpoint
12. **maintenance** — 2 endpoints (dev-only)
13. **root** — 1 endpoint

**Total: 53 endpoints across 13 domains**

---

## Gaps — expected by master plan but MISSING on backend

| Feature | Expected | Status |
|---------|---------|--------|
| **Survey system** | 3 survey types (by-sport / by-number / by-category) with FSM (DRAFT → SUBMITTED → APPROVED / REJECTED / FLAGGED → REVISION_REQUESTED) | ❌ Missing — `participation-per-sport` handles headcount submission but has no FSM, no status field, no approval workflow |
| **Survey review/submissions** | Admin endpoint to list surveys, approve/reject/flag/request revision | ❌ Missing — no submission review queue |
| **RBAC on OpenAPI** | Endpoints decorated with required roles in the OpenAPI security spec | ❌ Missing — all endpoints show as `public`; roles enforced via middleware only |
| **Reports (8 Khmer)** | 8 named report endpoints (RPT-SPORT-LIST, RPT-DELEGATION, RPT-NUMBER-LIST, RPT-ALBUM, RPT-ROSTER-ALL, RPT-LEADER-ALL, RPT-COACH-ATHLETE, RPT-DELEGATION-LEADERS) | ❌ Only 2 excel endpoints exist; 6 of 8 reports missing |
| **Organizers module** | Separate organizer management (leader/coach/asst-coach/staff) via organization | ❌ Not found as distinct domain — may be folded into registration (role=leader + leaderRole) |
| **Participation module** | Organization registers organizers separately from federation registering athletes | ⚠️ Unclear — registration endpoint handles both via `role` field but no separate route |
| **Password management** | Change password, reset password endpoints | ❌ Missing from auth domain |
| **Pagination/filtering params** | Query params for list endpoints (page, limit, search, filter by event/org) | ⚠️ Not documented in OpenAPI — may exist as undocumented query params |

---

## Extras — on backend but not in master plan

| Endpoint | Note |
|---------|------|
| `/api/cloudinary/presign-url` | Useful for photo/document uploads in registration flow — use this |
| `/api/maintenance/*` | Dev-only schema management — do not expose in frontend |
| `/api/root/` | Health check — use in deploy readiness checks |
| `/api/events/add-org-to-sport` | Richer than expected — admins can link specific orgs to specific sports within an event |
| `/api/events/remove-org-completely-from-event` | Bulk unlink — not in master plan but should be surfaced in the events module |

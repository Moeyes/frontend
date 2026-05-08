# Backend Endpoints Reference

> Auto-generated from `http://localhost:8000/api/openapi.json`.  
> Re-run `pnpm contract:sync` to refresh after backend changes.  
> **42 paths → 53 endpoint methods** (some paths expose multiple HTTP methods).

---

## AUTH

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `POST` | `/api/auth/login` | `LoginRequest` | `TokenPair` | Accepts username + password |
| `POST` | `/api/auth/refresh` | — (cookie/header) | `TokenPair` | Rotates access token |
| `GET` | `/api/auth/session/{user_id}` | — | `UserPublic` | Fetch current session user |

---

## USERS

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/users/` | — | `UsersPublic` | List all users |
| `POST` | `/api/users/` | `UserCreate` | `UserPublic` | Create user |
| `GET` | `/api/users/{user_id}` | — | `UserPublic` | Get single user |
| `PATCH` | `/api/users/update` | `UserUpdateBody` | `UserPublic` | Update user |
| `DELETE` | `/api/users/delete` | `UserDeleteBody` | — | Delete user |

---

## EVENTS

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/events/` | — | `EventsPublic` | List events |
| `POST` | `/api/events/` | `EventCreate` | `EventPublic` | Create event |
| `GET` | `/api/events/{event_id}` | — | `EventPublic` | Get event detail |
| `PATCH` | `/api/events/{event_id}` | `EventUpdate` | `EventPublic` | Update event |
| `DELETE` | `/api/events/delete` | `DeleteEventBody` | — | Delete event |
| `POST` | `/api/events/add-sport` | `SportsEventCreate` | `SportsEventPublic` | Attach sport to event |
| `DELETE` | `/api/events/remove-sport-from-event` | `RemoveSportFromEventBody` | — | Detach sport from event |
| `POST` | `/api/events/add-org-to-sport` | `EventSportOrgLink` | `SportsEventOrgPublic` | Link org to event+sport |
| `DELETE` | `/api/events/delete-event-sport-org-link` | `DeleteEventSportOrgLinkBody` | — | Unlink org from event+sport |
| `DELETE` | `/api/events/remove-org-completely-from-event` | `RemoveOrgCompletelyFromEventBody` | — | Remove org from all sports in event |
| `GET` | `/api/events/{event_id}/sports` | — | `[SportsEventPublic]` | List sports attached to event |
| `GET` | `/api/events/{event_id}/organizations` | — | `[EventOrgNamesPublic]` | List orgs in event |
| `GET` | `/api/events/{event_id}/sports/{sport_id}/categories` | — | `[CategoryPublic]` | Categories for a sport in event |
| `GET` | `/api/events/{event_id}/sports/{sport_id}/orgs` | — | `[SportEventOrgOnly]` | Orgs for a sport in event |

---

## SPORTS

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/sports/` | — | `SportsPublic` | List all sports |
| `POST` | `/api/sports/` | `SportCreate` | `SportPublic` | Create sport |
| `GET` | `/api/sports/{sport_id}` | — | `SportPublic` | Get sport detail |
| `POST` | `/api/sports/category` | `AddCategoryBody` | `CategoryPublic` | Add category to sport |
| `PATCH` | `/api/sports/category` | `UpdateCategoryBody` | `CategoryPublic` | Update category |
| `DELETE` | `/api/sports/category` | `DeleteCategoryBody` | — | Delete category |
| `GET` | `/api/sports/category/{category_id}` | — | `CategoryPublic` | Get category by ID |

---

## ORGANIZATIONS

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/organization/` | — | `OrganizationsPublic` | List organizations |
| `POST` | `/api/organization/` | `OrganizationCreate` | `OrganizationPublic` | Create organization |
| `GET` | `/api/organization/{org_id}` | — | `OrganizationPublic` | Get organization detail |
| `PATCH` | `/api/organization/update` | `OrganizationUpdateBody` | `OrganizationPublic` | Update organization |
| `DELETE` | `/api/organization/delete` | `OrganizationDeleteBody` | — | Delete organization |

---

## SURVEY / PARTICIPATION-PER-SPORT

> This domain covers the "survey" flow — federations reporting participation counts per sport.

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/participation-per-sport/` | — | `ParticipationPerSportPublicList` | List survey entries |
| `POST` | `/api/participation-per-sport/` | `ParticipationPerSportCreate` | `ParticipationPerSportPublic` | Submit survey entry |
| `GET` | `/api/participation-per-sport/{id}` | — | `ParticipationPerSportPublic` | Get single entry |
| `PATCH` | `/api/participation-per-sport/{id}` | `ParticipationPerSportUpdate` | `ParticipationPerSportPublic` | Update entry |
| `DELETE` | `/api/participation-per-sport/{id}` | — | `ParticipationPerSportPublic` | Delete entry |

---

## REGISTRATIONS (Participants)

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/registration/` | — | — | List participants |
| `POST` | `/api/registration/` | (multipart body) | — | Register participant (with documents) |
| `GET` | `/api/registration/{enroll_id}` | — | — | Get participant detail |
| `PATCH` | `/api/registration/update` | `ParticipantUpdateBody` | — | Update participant |
| `DELETE` | `/api/registration/delete` | `ParticipantDeleteBody` | — | Delete participant |

---

## REPORTS (Excel)

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/excel/org-sport` | — | `OrgSportParticipantFullResponse` | Full participant detail per org+sport |
| `GET` | `/api/excel/org-sport-participant` | — | `OrgSportParticipantExcelResponse` | Participant counts per org+sport |

---

## CARDS

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/card/{p_id}/{org_id}/{event_id}` | — | `CardResponse` | Get single participant card |
| `GET` | `/api/cards/{org_id}/{event_id}` | — | `PaginatedCardsResponse` | List cards for org in event |

---

## DASHBOARD

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/dashboard` | — | `DashboardResponse` | System-wide stats |

---

## UPLOADS

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/cloudinary/presign-url` | — | `PresignUrlResponse` | Get Cloudinary presigned upload URL |

---

## MAINTENANCE ⚠️

> **Dangerous — do not expose to any frontend role.**

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `POST` | `/api/maintenance/drop` | — | — | Drops entire DB schema |
| `POST` | `/api/maintenance/sync-schema` | — | — | Syncs DB schema |

---

## ROOT

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| `GET` | `/api/root/` | — | — | Health check / root response |

---

## Summary

**Total: 53 endpoint methods across 42 paths**

### Domains found
1. `auth` — 3 endpoints
2. `users` — 5 endpoints
3. `events` — 14 endpoints
4. `sports` — 7 endpoints
5. `organizations` — 5 endpoints
6. `survey/participation-per-sport` — 5 endpoints
7. `registrations` — 5 endpoints
8. `reports/excel` — 2 endpoints
9. `cards` — 2 endpoints
10. `dashboard` — 1 endpoint
11. `uploads/cloudinary` — 1 endpoint
12. `maintenance` — 2 endpoints ⚠️
13. `root` — 1 endpoint

---

## Gap Analysis

### Expected by master plan but MISSING on backend

These are endpoints or capabilities the master plan requires that have no backend equivalent:

| Expected capability | Master plan reference | Gap notes |
|--------------------|-----------------------|-----------|
| Survey FSM transitions: `DRAFT → SUBMITTED → APPROVED / REJECTED / FLAGGED → REVISION_REQUESTED` | Red Lines #5, Scenario 6 | No status transition endpoints exist. `/api/participation-per-sport/{id}` has PATCH (which may accept `status`) but dedicated FSM endpoints (`/approve`, `/reject`, `/flag`) are absent |
| Submission review queue (admin reviews federation surveys) | Module 9 — `submissions` | No dedicated submissions/review endpoint; the review flow would need to go through `participation-per-sport` PATCH — semantics unclear |
| Event status transitions (DRAFT → PUBLISHED etc.) | Scenario 1 | `PATCH /api/events/{event_id}` exists but no dedicated publish/unpublish endpoint; status via PATCH body may violate Red Line #5 |
| Per-sport quota enforcement | Scenario 1 ("quotas") | `SportsEventCreate` request shape may carry quota — needs verification in `api.types.ts` |
| Federation-scoped list filtering (`federation_id` param) | Red Line #6 | List endpoints (`/api/registration/`, `/api/participation-per-sport/`, `/api/events/`) show no query param filtering in spec; needs confirmation from teammate |
| Organization-scoped list filtering (`org_id` param) | Red Line #6 | Same concern as above |
| Document upload association to participant | Scenario 7 | `/api/registration/` POST body type is `(body)` — unclear if document upload (Cloudinary URL) is part of this body or separate |
| User role management / role assignment | Module 4 — `users` | `UserCreate`/`UserUpdateBody` shapes need to confirm they carry a `role` field — check `api.types.ts` |
| Pagination params on list endpoints | Conventions — server-side pagination | No `page`/`limit` query params visible in spec for most list endpoints — needs confirmation |
| Reports: 6 of 8 Khmer reports | Module 12 — `reports` | Only 2 Excel endpoints exist; RPT-ALBUM, RPT-ROSTER-ALL, RPT-LEADER-ALL, RPT-COACH-ATHLETE, RPT-DELEGATION, RPT-DELEGATION-LEADERS, RPT-SPORT-LIST, RPT-NUMBER-LIST are all absent or unmapped |

### On backend but NOT mentioned in master plan (potential extras)

| Endpoint | Notes |
|----------|-------|
| `POST /api/maintenance/drop` | Drops the entire DB — must never be reachable from frontend |
| `POST /api/maintenance/sync-schema` | Dev-only DDL sync — must never be reachable from frontend |
| `GET /api/root/` | Health check — useful for monitoring, not a frontend feature |
| `GET /api/cloudinary/presign-url` | Not in master plan explicitly, but needed for document upload (Scenario 7) — treat as implicit dependency |
| `DELETE /api/participation-per-sport/{id}` | Master plan doesn't describe deleting survey entries — clarify with teammate whether this is admin-only |
| `DELETE /api/events/remove-org-completely-from-event` | Powerful bulk delete — verify RBAC: Admin-only |

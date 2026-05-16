# Roadmap

Features deferred from the 8-week rebuild, planned enhancements, and longer-horizon ideas. Priority order is approximate and subject to ministry requirements.

---

## Near-term (next 3 months)

### Complete the 8 Khmer reports

6 of 8 reports are frontend-ready but show "Backend required" because the backend endpoints don't exist yet. Once the backend team implements them, the frontend needs only minor wiring:

| Report | Status |
|---|---|
| RPT-DELEGATION | Backend endpoint needed |
| RPT-SPORT-LIST | Backend endpoint needed |
| RPT-ALBUM | Backend endpoint needed |
| RPT-LEADER-ALL | Backend endpoint needed |
| RPT-COACH-ATHLETE | Backend endpoint needed |
| RPT-DELEGATION-LEADERS | Backend endpoint needed |

### Participant and organizer detail pages

Currently `/register/[id]` and `/participation/[id]` show a "coming soon" placeholder. Implement read-only detail pages showing:
- Full personal information (Khmer + English name, DOB, phone, address)
- Document upload status (photo / NID / birth cert)
- Registered event, sport, category, role

### In-app notifications

When an admin approves or rejects a survey or registration, the federation/organization should see an in-app notification. Backend must add a notifications endpoint. Frontend would poll or use WebSocket.

### Participant search and filter improvements

Current search is name-only. Add:
- Filter by sport
- Filter by role (athlete / leader)
- Filter by document completeness
- Export filtered list as CSV

---

## Medium-term (3–6 months)

### Cloudinary authenticated delivery (security)

Replace permanent public Cloudinary URLs with signed TTL URLs. Required for compliance — citizen ID documents should not be permanently accessible to anyone with the URL. Requires backend configuration and a frontend change to fetch a fresh signed URL on demand.

### Audit log UI

Admin should be able to view a searchable log of: who did what, when, from which IP. Backend records these events. A simple read-only list with filters (user, action type, date range) is needed on the frontend.

### Quota enforcement UI improvements

Currently quotas are stored but not enforced with a visible feedback to the user. Show a remaining-quota counter per sport in the registration flow. Block registration when quota is full with a clear Khmer error message.

### Bulk registration document upload

Team mode (CSV) currently doesn't support document uploads — documents must be added individually. Add a follow-up document upload step that links uploads to specific enrollment IDs from the batch.

### Report scheduling and email delivery

Allow admin to schedule automatic report generation on a date and email the Excel to a ministry email address. Requires a background job system on the backend.

---

## Longer-term (6+ months)

### Mobile app

A React Native or Progressive Web App for federation users to register athletes on-site at events (poor connectivity, scanning IDs with camera). Key requirements:
- Offline-first (sync when connected)
- Camera integration for document photos
- Khmer UI with touch-optimized components

### Public athlete profile pages

A read-only public site where anyone can look up a registered athlete's sport and event history. This would be a separate Next.js app (not the admin portal) with public access — no auth required.

### Advanced analytics dashboard

Beyond the current basic stats:
- Year-over-year participation trends per sport
- Organization performance comparison
- Age distribution charts (using Recharts or similar)
- Gender parity tracking per event

### Medalist module

Record medal winners per event, per sport, per category. Generate medal tables and display on a results screen. Would require new backend endpoints and a new frontend module.

### Multi-event support on one screen

Currently the dashboard shows stats for all events combined. Add event-scoped views where admin can filter the entire dashboard by a specific event.

---

## Known deferred items from the 8-week rebuild

These were explicitly out of scope during the rebuild and are tracked here to ensure they're not forgotten:

| Item | Deferred from | Reason |
|---|---|---|
| `organization_id` in UserPublic session | All releases | Backend gap — backend hasn't added this field to the session endpoint yet |
| By-category survey persistence | v0.6-pilot | Backend has no `category_id` field on `ParticipationPerSportCreate` |
| Cross-federation IDOR protection (server-enforced) | All releases | Backend must enforce this — frontend passes `organization_id` but backend must validate |
| Revision request reason field on survey rejection | v0.4-beta | No `reason` field on the backend FSM transitions |
| Per-sport quota enforcement at save time | v0.6-pilot | Backend has no quota validation endpoint |
| Participant detail/edit page | v1.0 | Placeholder exists; implementation deferred |
| Organizer detail/edit page | v1.0 | Placeholder exists; implementation deferred |

# Releases — W4 Beta, W6 Pilot, W8 Production

Three planned releases. Each has frozen scope, a target audience, success criteria, and what's explicitly NOT in scope.

## W4 — Internal Beta (v0.4-beta)

**Date:** End of Week 4 (Friday evening)

**Audience:** Ministry tech team + 1–2 friendly federations (controlled testers)

**Purpose:** Validate the survey workflow end-to-end with controlled data before exposing to real federations.

### In scope

- Login as Super Admin, Admin, Federation, Organization
- Role-aware dashboard (basic KPIs)
- User management (Admin creates federation/org users)
- Sport CRUD (Admin manages sports + categories)
- Federation CRUD (Admin manages federations)
- Organization CRUD (Admin manages orgs)
- Event lifecycle: create → attach sports + quotas → publish
- Survey BY_SPORT (per-sport headcount entry by federation)
- Survey BY_NUMBER (total participants per sport)
- Survey BY_CATEGORY (M/F × age band breakdown)
- Admin review queue: approve, reject with revision request, flag
- Khmer + English UI working
- HttpOnly cookie auth working

### Explicitly NOT in scope (deferred to W6 or W8)

- Participant registration (Federation can't add athletes yet — survey only)
- Organizer registration (no leader/coach entry yet)
- Reports (no exports yet)
- Audit log review UI
- Advanced filtering/search
- Performance hardening
- Mobile responsiveness polish
- Card module
- All 8 ministry reports

### Success criteria

- Beta testers can complete the full survey loop without help: login → see assigned event → submit BY_SPORT survey → see status update after admin review
- Admin can review 10 surveys in one sitting without confusion
- No critical bugs (P0) reported during 2-day beta
- Khmer text renders correctly in all surfaces tested
- RBAC verified: Federation A cannot see Federation B's surveys

### Demo flow (40 minutes)

1. Login as Super Admin → show user dashboard, create new admin user (3 min)
2. Login as Admin → create event "ព្រឹត្តិការណ៍កីឡាជាតិ ២០២៦" → attach 3 sports with quotas → publish (8 min)
3. Login as Federation → see published event → submit BY_SPORT survey (8 min)
4. Login as Admin → review survey → reject with revision request (5 min)
5. Federation → fix and resubmit (5 min)
6. Admin → approve (3 min)
7. Repeat with BY_NUMBER and BY_CATEGORY survey types (5 min)
8. Q&A with testers (3 min)

### Feedback collection

- Bug tracker link shared with testers
- Daily check-in for 2 days post-beta
- All bugs triaged into W5 fix list

---

## W6 — Pilot (v0.6-pilot)

**Date:** End of Week 6 (Friday evening)

**Audience:** 3–5 real federations + ministry admin staff for one real event

**Purpose:** Real federations submit real data for one real event. Stress-test the registration flow and the most critical reports.

### In scope (everything from W4 beta, PLUS)

- Participant registration ALONE mode (one participant at a time)
- Document upload (birth certificate / NID / passport)
- Age computed from event date
- Document type rule by age (<18 → birth cert; ≥18 → NID/passport)
- Per-sport quota enforcement at registration time
- Organizer registration (Org submits leaders/coaches/asst-coaches/staff)
- Admin approval/rejection of registrations
- Admin approval/rejection of organizers
- 4 most-critical Khmer reports:
  - **RPT-DELEGATION** — តារាងទិន្នន័យក្រុមចូលរួមកីឡា
  - **RPT-ROSTER-ALL** — បញ្ជីរាយនាមរួម
  - **RPT-NUMBER-LIST** — បញ្ជីចំនួនតាមប្រភេទកីឡា
  - **RPT-SPORT-LIST** — ចុះប្រភេទកីឡា
- Report generation as async job + signed download URL
- Notifications (in-app) for status changes

### Explicitly NOT in scope (deferred to W7 or W8)

- TEAM mode registration (bulk entry)
- Remaining 4 reports (RPT-ALBUM, RPT-LEADER-ALL, RPT-COACH-ATHLETE, RPT-DELEGATION-LEADERS)
- Flag/review advanced workflow
- Cards module
- Performance optimization
- Email/SMS notifications

### Success criteria

- 3+ federations submit at least 5 participants each
- Each registration has correct documents (birth cert OR NID/passport based on age)
- Admin reviews and approves 80%+ of registrations within 2 days of pilot start
- All 4 reports generate correctly with real data and match ministry templates
- No P0 bugs blocking registration submission
- Average time per registration < 5 minutes for federation user

### Pilot kickoff

- 1-hour training session for pilot federations on Friday afternoon
- Each federation given a credentials packet
- Each federation has a "buddy" (ministry tech contact) for first 3 days
- Pilot runs for 7 days (W6 Fri → W7 Fri)
- Daily standup with pilot users for first 3 days

### Feedback collection

- Bug tracker link shared with all pilot users
- Daily standup with ministry admin for first 3 days of pilot
- W7 reserved Mon–Wed for fixes

---

## W8 — Production (v1.0)

**Date:** End of Week 8 (Friday afternoon)

**Audience:** All federations and organizations participating in the upcoming event

**Purpose:** Real production use for an actual event.

### In scope (everything from W6 pilot, PLUS)

- TEAM mode registration (bulk entry via CSV import or table form)
- All 8 Khmer ministry reports (4 already in pilot + 4 new):
  - **RPT-ALBUM** — អាល់ប៊ុមប្រតិភូ
  - **RPT-LEADER-ALL** — បញ្ជីថ្នាក់ដឹកនាំ
  - **RPT-COACH-ATHLETE** — បញ្ជីគ្រូបង្វឹក កីឡាករ កីឡាការិនី
  - **RPT-DELEGATION-LEADERS** — បញ្ជីប្រតិភូ និងអ្នកដឹកនាំក្រុម
- Cards module (basic)
- Flag/review workflow for admin
- Performance hardening (p95 < 400ms, 1000 concurrent users tested)
- Accessibility pass (WCAG 2.1 AA)
- RBAC audit (verified zero cross-tenant leaks)
- Backup + restore tested
- Production deploy with monitoring + alerting

### Out of scope (true future work, not blockers for W8)

- Public-facing pages (athlete/spectator views)
- Mobile app
- Advanced analytics dashboards
- SSO integration
- Medalist module (will be added later)

### Success criteria

- All 13 modules deployed and accessible
- All 8 reports validated against ministry templates
- Load test: 1000 concurrent users, p95 < 400ms, 0% errors
- RBAC test: zero cross-federation data leaks across 50 random checks
- Backup/restore drill completes successfully (RTO < 1h, RPO < 15m)
- Accessibility: axe-core zero critical violations
- Khmer rendering verified across Windows, macOS, Linux, iOS preview
- Training materials delivered to ministry
- Runbook published for operations team
- Ministry stakeholder sign-off

### Production deploy checklist

- [ ] All env vars set in production (no defaults from .env)
- [ ] Production database with backups configured
- [ ] CDN + TLS configured
- [ ] Monitoring (Prometheus / Grafana) deployed
- [ ] Alert rules defined and routed (Slack/email)
- [ ] Error tracking (Sentry) configured
- [ ] Audit log table indexes verified
- [ ] Documentation deployed and accessible
- [ ] On-call rotation defined
- [ ] Rollback procedure tested
- [ ] DNS cutover plan
- [ ] Stakeholder sign-off email received

---

## Release principles

1. **Frozen scope.** Once a release date is set, scope can shrink but not grow.
2. **Real users at every release.** Beta = friendly, Pilot = real federations, Production = all users.
3. **Feedback time built in.** W5 and W7 have explicit feedback days.
4. **No catch-up.** If a release slips, the next one slips by the same amount. Rushing causes bugs.
5. **Definition of "released" requires the success criteria, not just deployed code.**

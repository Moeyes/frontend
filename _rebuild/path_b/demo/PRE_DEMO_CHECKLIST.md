# Pre-Demo Checklist — May 20, 2026

## 🕐 1 hour before demo

### Infrastructure
- [ ] Staging URL opens (login page visible)
- [ ] Backend is responding (try logging in)
- [ ] Internet connection stable (test with speedtest.net if uncertain)

### User accounts (test each login)
- [ ] `admin_demo` / `TestDemo2026!` → shows admin dashboard
- [ ] `finance_org_demo` / `TestDemo2026!` → shows org dashboard (run DemoOrgIdSetter if yellow banner appears)
- [ ] `interior_org_demo` / `TestDemo2026!` → shows org dashboard
- [ ] `football_fed_demo` / `TestDemo2026!` → shows federation dashboard

### Demo data
- [ ] At least 1 event visible with status PUBLISHED and 5 sports attached
- [ ] Admin → Submissions → at least 1 submission visible (from seeded survey)
- [ ] Reports tab → select event + org → "Download Excel" button becomes active

### Reports
- [ ] Click Download Excel on RPT-3 → file downloads (not 404)
- [ ] Open downloaded Excel → Khmer text visible (not boxes)
- [ ] Click PDF on RPT-3 → browser print dialog opens → Khmer renders

### Documents
- [ ] Sample birth certificate PDF ready on desktop for upload during demo
- [ ] Sample photo JPG ready for athlete registration

### Presentation
- [ ] Ministry Excel template open and ready for side-by-side comparison
- [ ] HANDOUT.md printed (or PDF version on screen) — 1 per attendee
- [ ] DEMO_SCRIPT.md open in a side window for reference
- [ ] Screen share tested

---

## 🕛 15 minutes before demo

- [ ] Final login as each role in sequence — confirm it still works
- [ ] Perform one quick by-sport survey submission as org user → confirm success toast
- [ ] Approve it as admin → confirm status update
- [ ] Browser: DND mode on, notifications off, irrelevant tabs closed
- [ ] Zoom/Teams: camera tested, microphone tested
- [ ] Fallback ready: if demo fails completely, have screenshots from verification session

---

## ⚠️ Critical workarounds to remember

### DemoOrgIdSetter
When logging in as an Organization user for the first time on a new browser:
1. Yellow banner appears on dashboard → "organization_id — ត្រូវការជ្រើសរើសអង្គការ"
2. Select "ក្រសួងសេដ្ឋកិច្ច និងហិរញ្ញវត្ថុ" from dropdown
3. Click "រក្សាទុក" → page reloads → banner gone → proceed

This only needs to happen once per browser session (localStorage persists).

### If backend is slow
Survey forms have auto-save (30-second interval). Don't spam the Submit button. Wait for the success toast before navigating away.

### If Excel download doesn't start
Check browser's download permissions — it may have blocked the automatic download. Click the file icon in the address bar and allow downloads.

---

## 🆘 Fallback plan

If the live demo breaks:
1. **Stay calm** — "Let me show you what this looks like from our testing..."
2. Have screenshots from E2E_VERIFICATION_REPORT.md as backup
3. Show the HANDOUT instead and walk through features verbally
4. Offer to schedule a follow-up demo within 48 hours if needed

**Do NOT fix bugs during the demo.** Note them for the post-pitch sprint.

---

## 📝 During demo — Feedback notes

Use this space to write down verbatim feedback:

```
Feature requests:
1. 
2. 
3. 

Issues observed:
1. 
2. 

Priorities for v1.0 (asked at end):
1. 
2. 
3. 
```

---

## ✅ After demo
- [ ] Save feedback notes above immediately
- [ ] Thank attendees, confirm v1.0 timeline (end of May)
- [ ] Send HANDOUT.pdf to attendees by email
- [ ] Paste feedback into Claude.ai chat for triage into B7 post-pitch sprint

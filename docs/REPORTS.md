# Report Generation

## The 8 ministry reports

| ID | Filename | Khmer title | English title | Purpose |
|---|---|---|---|---|
| 1 | RPT-ROSTER-ALL | បញ្ជីរាយនាមរួម | Full Roster | Complete participant list per org and sport |
| 2 | RPT-NUMBER-LIST | បញ្ជីចំនួន | Participant Counts | Summary counts by sport (M/F/Leader) |
| 3 | RPT-DELEGATION | តារាងទិន្នន័យក្រុម | Delegation Table | Full participant + leader detail per org |
| 4 | RPT-SPORT-LIST | ចុះប្រភេទកីឡា | Sport Type List | Total participants by sport (whole event) |
| 5 | RPT-ALBUM | អាល់ប៊ុមប្រតិភូ | Participant Album | Participant list with photo URLs |
| 6 | RPT-LEADER-ALL | បញ្ជីថ្នាក់ដឹកនាំ | All Leaders | All leaders across all organizations |
| 7 | RPT-COACH-ATHLETE | គ្រូបង្វឹក + កីឡាករ | Coach + Athlete | Coaches paired with their athletes by sport |
| 8 | RPT-DELEGATION-LEADERS | ប្រតិភូ + អ្នកដឹកនាំក្រុម | Delegation Leaders | Team leaders for the selected organization |

### Columns per report

**RPT-ROSTER-ALL** — Full participant roster:
`Organization | Sport | Khmer Name | English Name | Gender | DOB | Role | Document status`

**RPT-NUMBER-LIST** — Counts summary:
`Sport | Athletes (M) ប | Athletes (F) ស | Leaders អ.ដ | Total សរុប`

**RPT-DELEGATION** — Delegation detail:
`# | Khmer Name | English Name | Gender | DOB | Role | Leader Role | Sport | Category`

**RPT-SPORT-LIST** — By sport:
`Sport | Categories | Total M | Total F | Total Leaders | Grand Total`

**RPT-ALBUM** — Photo album:
`# | Name | Organization | Sport | Role | Photo URL`

**RPT-LEADER-ALL** — All leaders:
`# | Khmer Name | English Name | Gender | DOB | Leader Role | Organization`

**RPT-COACH-ATHLETE** — Coach + athlete pairing:
`Coach | Sport | Athletes (paired list)`

**RPT-DELEGATION-LEADERS** — Delegation leaders:
`# | Name | Gender | DOB | Leader Role | Organization`

---

## How report generation works

```
1. Admin selects Event + Organization in the Reports filter bar
2. Admin clicks "Download Excel" for a specific report
3. Frontend → GET /api/excel/{report-path}?org_id=N&events_id=N
   (credentials: 'include' so middleware injects Bearer token)
4. Backend generates Excel from the DB, returns binary blob
5. Frontend receives blob → creates object URL → triggers browser download
6. Object URL is revoked after download completes
```

The report download is handled by `downloadExcelBlob()` in `modules/reports/services/reports.service.ts`.

### Backend endpoint availability

| Report | Backend endpoint | Status |
|---|---|---|
| RPT-ROSTER-ALL | `GET /api/excel/org-sport` | ✅ Available |
| RPT-NUMBER-LIST | `GET /api/excel/org-sport-participant` | ✅ Available |
| RPT-DELEGATION | `GET /api/excel/delegation` | ⚠️ Pending backend |
| RPT-SPORT-LIST | `GET /api/excel/sport-list` | ⚠️ Pending backend |
| RPT-ALBUM | `GET /api/excel/album` | ⚠️ Pending backend |
| RPT-LEADER-ALL | `GET /api/excel/leader-all` | ⚠️ Pending backend |
| RPT-COACH-ATHLETE | `GET /api/excel/coach-athlete` | ⚠️ Pending backend |
| RPT-DELEGATION-LEADERS | `GET /api/excel/delegation-leaders` | ⚠️ Pending backend |

Reports with missing backend endpoints show a "Backend required — not yet available" label and a disabled download button. This prevents user confusion.

---

## How to add a new report

1. Add the report definition to the `REPORTS` array in `modules/reports/components/ReportsPage.tsx`:

```ts
{
  titleKey:     'reports.rptMyReport.title',
  descKey:      'reports.rptMyReport.description',
  available:    true,              // set to false if backend not ready
  downloadPath: '/api/excel/my-report',
  filenameKey:  'reports.rptMyReport.filename',
},
```

2. Add i18n keys to both `messages/en.json` and `messages/kh.json`:

```json
"rptMyReport": {
  "title":       "My Report (RPT-MY-REPORT)",
  "description": "Description of what this report contains",
  "filename":    "RPT-MY-REPORT"
}
```

3. If the report needs org_id/event_id, it will automatically use the current `ReportFilterBar` selection. If it doesn't need `org_id`, set `requiresOrgId: false` in the config.

4. Verify the backend endpoint exists and test by downloading a sample Excel with real data.

---

## Report filter bar

Reports require both `event_id` and `org_id` to be selected before downloading. The `ReportFilterBar` component manages this state. If either filter is missing, the download button is disabled with a hint message.

Some reports (RPT-SPORT-LIST, RPT-LEADER-ALL) aggregate across all organizations for an event — they set `requiresOrgId: false` and bypass the org filter.

---

## Testing report output

Manual testing checklist (cannot be fully automated):

1. **Download a report** with known data (seed data or staging)
2. **Open in LibreOffice/Excel** — verify:
   - Khmer column headers render correctly (not garbled)
   - Khmer names in cells are readable
   - Numbers are formatted correctly (not text)
3. **Check content accuracy:**
   - Row count matches what you see in the registration list
   - Sport names match the event's attached sports
   - Gender totals add up
4. **Print preview** — check layout fits A4

If Khmer text shows `???` or boxes, the backend is not writing the correct font to the Excel cells. File a backend issue.

---

## Khmer template files location

Excel templates (if used) are managed by the backend, not the frontend. Ask your backend teammate for the template file location. The frontend only receives the final binary output.

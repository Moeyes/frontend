# Demo Script — v0.5 Beta Pitch
**Date:** Tuesday May 20, 2026  
**Total time:** 15 minutes + Q&A  
**Presenter:** You

---

## Setup before demo (do this 30 min before)

- [ ] Open staging URL in Chrome, cleared cache
- [ ] Have CREDENTIALS.md open in a secure, off-screen window
- [ ] Have the ministry Excel template ready on your desktop for comparison
- [ ] Have two browser windows side-by-side: the app + the Excel template
- [ ] Quiet notifications (DND mode)
- [ ] Camera and screen share tested

---

## Part 1 — Admin: Event Setup (3 min)

**Login:** `admin_demo` / `TestDemo2026!`

**What to show:**
1. Dashboard → admin overview (event counts, participant counts)
2. Click **Events** in sidebar
3. Click on the pre-created event: "ការប្រកួតកីឡាជាតិលើកទី៥ ឆ្នាំ២០២៦ (DEMO)"
4. Show the 5 sports attached with quotas
5. Show the event status: PUBLISHED

**Talking points:**
- ខ្មែរ: "ជំហានដំបូង — ការបង្កើតព្រឹត្តិការណ៍ — Admin បង្កើតព្រឹត្តិការណ៍ ភ្ជាប់ប្រភេទកីឡា និងផ្សព្វផ្សាយ"
- English: "First step — Admin creates the national sports event, attaches 5 sports with participant quotas, then publishes it. Organizations only see the event after it's published."

---

## Part 2 — Organization: Submit Surveys (5 min)

**Logout. Login as:** `finance_org_demo` / `TestDemo2026!`

> ⚠️ **If yellow banner appears on dashboard:** Select "ក្រសួងសេដ្ឋកិច្ច និងហិរញ្ញវត្ថុ" from the dropdown and click "រក្សាទុក". Page reloads. Continue.

**What to show:**
1. Dashboard → organization welcome screen
2. Click **ការស្ទង់មតិ** (Surveys) in sidebar
3. See the published event listed
4. Click **ចុះប្រភេទកីឡា** (By-Sport Survey)
5. Fill in 3–4 sport rows (M/F counts) — be quick, values don't need to be exact
6. Click **ដាក់ស្នើ** (Submit) → success toast
7. Go back. Click **បញ្ជីចំនួនតាមប្រភេទកីឡា** (By-Number Survey)
8. Fill the per-sport rows — point out the **live auto-computation** of subtotals
9. Submit

**Talking points:**
- ខ្មែរ: "អង្គការ (ក្រសួង/ខេត្ត) ចូលទៅប្រើប្រព័ន្ធ — ពួកគេឃើញតែព្រឹត្តិការណ៍ដែលស្ថាប័នរបស់ពួកគេត្រូវបានអញ្ជើញ"
- English: "This is the main actor — each ministry or province submits their participation plan. The form automatically computes totals in real-time as you type, matching the Excel template columns exactly."
- Point at the column headers: ប្រតិភូ, ដឹកនាំ, គ្រូបង្វឹក, អត្តពលិក — same as the paper form they use now.

---

## Part 3 — Organization: Register an Athlete (3 min)

**Same login (finance_org_demo)**

**What to show:**
1. Click **ការចុះឈ្មោះ** (Registration) in sidebar
2. Click **បន្ថែមអ្នកចូលរួម** (Add Participant)
3. Step 1: Select the event, select Football, role = Athlete
4. Step 2: Fill name (Khmer + Latin), gender, DOB = **2010-06-15**
5. Point out: *"Age at event date 2027-01-01 = 16 years old"*
6. Step 3 (Documents): Show the **yellow banner** — "Birth certificate required (age < 18)"
7. Upload a sample birth certificate PDF
8. Step 4 (Review): Show the review screen — name, sport, role, doc count
9. Submit → success toast

**Talking points:**
- ខ្មែរ: "ប្រព័ន្ធគណនាអាយុដោយស្វ័យប្រវត្តិ — ប្រើថ្ងៃចាប់ផ្ដើមការប្រកួតជាមូលដ្ឋាន មិនមែនថ្ងៃនេះ"
- English: "The age rule is automatic — the system checks the athlete's age *at the event start date*. 16-year-olds get a 'birth certificate required' prompt; 18+ gets the national ID option. This follows the exact ministry rule."

---

## Part 4 — Admin: Review & Approve (2 min)

**Logout. Login as:** `admin_demo` / `TestDemo2026!`

**What to show:**
1. Click **ការពិនិត្យ** (Submissions) in sidebar
2. Show the list of survey entries from the organization
3. Click on one → show the detail with Approve/Reject/Flag buttons
4. Click **អនុម័ត** (Approve) → status changes to APPROVED

**Talking points:**
- ខ្មែរ: "Admin ពិនិត្យ​ហើយ​អនុម័ត ឬ​បដិសេធ — ការ​ស្ទង់​មតិ​ទាំងអស់​ដែលបានដាក់ស្នើ​ត្រូវ​ឆ្លងកាត់​ការពិនិត្យ​ពី​Admin មុននឹងប្រើក្នុងរបាយការណ៍"
- English: "Admin has a review queue — approve, reject, or flag for follow-up. Status changes propagate in real-time."

---

## Part 5 — Admin: Generate Reports (2 min)

**Same admin login**

**What to show:**
1. Click **របាយការណ៍** (Reports) in sidebar
2. Select event from dropdown, select organization "ក្រសួងសេដ្ឋកិច្ច"
3. Click **ទាញយក Excel** on **ចុះចំនួន** (RPT-3 — Numbers per org)
4. Open downloaded Excel → show the Khmer headers, column structure
5. Put it side-by-side with the ministry template → **they match**
6. Back in app: click **PDF** on RPT-3 → browser print dialog → show Khmer rendering

**Talking points:**
- ខ្មែរ: "របាយការណ៍ Excel ទាញចេញត្រូវនឹងទម្រង់ក្រសួង — header ដូចគ្នា ជួរដូចគ្នា រូបមន្តដូចគ្នា"
- English: "The Excel download matches the ministry template exactly — same header band, same 14 columns, same formulas. Ministry staff can open this in Excel and it just works, including the auto-computed totals in columns K through N."

---

## Q&A Prep

**Expected questions and suggested answers:**

| Question | Answer |
|---|---|
| "Can organizations see each other's data?" | "No — each org sees only their own data. The system enforces this at every list query." |
| "What about the album report (RPT-4)?" | "Deferred to v1.0 — it's on the list. Photo upload is already captured in registration." |
| "Can it handle 1000+ athletes?" | "The architecture supports it; we haven't load-tested yet — that's a v1.0 deliverable." |
| "What's the timeline for Federation features?" | "By-category survey (Federation's main form) is already built — it's in the survey module. We'll wire it in fully for v1.0." |
| "Can we have a Khmer PDF handout?" | "Yes — I have one for you." (hand out HANDOUT.md printed) |

**If something breaks mid-demo:**
- Stay calm: "Let me show you the next screen while this loads..."
- Fallback: Have screenshots ready in a backup slide deck

---

## After demo

- "What features would you prioritize for v1.0?"
- Take notes verbatim
- Confirm timeline: v1.0 by end of May
- Share the HANDOUT (PDF) with all attendees

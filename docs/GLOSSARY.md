# Glossary

## Ministry and domain terms

| Term | Khmer | Definition |
|---|---|---|
| **Event** | ព្រឹត្តិការណ៍ | A national sports competition (e.g., "National Games 2026"). Contains many sports. |
| **Sport** | កីឡា | A discipline within an event (e.g., football, swimming). Has categories (MALE/FEMALE). |
| **Category** | ប្រភេទ | A gender + age band subdivision within a sport (e.g., "Football — Male"). |
| **Federation** | សហព័ន្ធ | A sport federation that submits surveys and registers athletes. Maps to `role = user1`. |
| **Organization** | អង្គការ | A province or ministry that registers organizers. Maps to `role = user2`. |
| **Organizer** | អ្នករៀបចំ | An individual registered as a team official (coach, manager, delegate). |
| **Participant** | អ្នកចូលរួម | An individual registered as an athlete for an event. |
| **Survey** | ការស្ទង់មតិ | A federation's estimate of how many athletes/leaders it plans to send per sport. |
| **Submission** | ការស្នើ | A completed survey entry awaiting admin review. |
| **Enrollment** | ចុះឈ្មោះ | The act of registering a participant or organizer in the system. |
| **Delegation** | ប្រតិភូ | The full group of participants + organizers representing an organization at an event. |
| **Quota** | កូតា | The maximum number of participants an organization can register for a sport. |
| **Report** | របាយការណ៍ | An official Excel document generated for ministry use (8 types). |
| **Card** | កាតអត្តសញ្ញាណ | A participant identity card with photo, name, sport, and role. |

---

## Role terminology

| System name | Code | Khmer | Meaning |
|---|---|---|---|
| Admin | `admin` | អ្នកគ្រប់គ្រង | Ministry staff with full system access |
| Federation user | `user1` | អ្នកប្រើប្រាស់ (សហព័ន្ធ) | Sport federation representative |
| Organization user | `user2` | អ្នកប្រើប្រាស់ (អង្គការ) | Province/ministry organization representative |
| Guest | `guest` | ភ្ញៀវ | Read-only observer |

---

## Survey types

| Type | Code | Khmer | What it collects |
|---|---|---|---|
| By sport | `by-sport` | តាមកីឡា | M/F athlete + leader counts per sport |
| By number | `by-number` | តាមចំនួន | Total counts only (no sport breakdown) |
| By category | `by-category` | តាមប្រភេទ | M/F counts per category within each sport |

---

## Survey/submission status values

| Status | Khmer | Meaning |
|---|---|---|
| PENDING | រង់ចាំ | Entry created but not submitted |
| SUBMITTED | បានដាក់ស្នើ | Federation submitted; awaiting admin review |
| APPROVED | អនុម័ត | Admin approved the counts |
| REJECTED | បដិសេធ | Admin rejected; federation must revise |
| FLAGGED | ដាក់ទង់ | Admin flagged for follow-up |

---

## Document types

| Document | Khmer | Required when |
|---|---|---|
| Birth certificate | សំបុត្រកំណើត | Participant age < 18 at event start date |
| National ID | អត្តសញ្ញាណប័ណ្ណ | Participant age ≥ 18 |
| Passport | លិខិតឆ្លងដែន | Participant age ≥ 18 (alternative to NID) |
| Profile photo | រូបថតប្រវត្តិរូប | All adult participants (age ≥ 18) |

---

## Leader roles

| Code | Khmer | English |
|---|---|---|
| `coach` | គ្រូបង្វឹក | Coach |
| `manager` | អ្នកគ្រប់គ្រង | Manager |
| `delegate` | ប្រតិភូ | Delegate |
| `team_lead` | ប្រធានក្រុម | Team Lead |
| `coach_trainer` | គ្រូបង្វឹកជំនាញ | Coach Trainer |
| `teacher_assistant` | ជំនួយការ | Teacher Assistant |

---

## The 8 reports — Khmer–English map

| Filename | Khmer title | English title |
|---|---|---|
| RPT-ROSTER-ALL | បញ្ជីរាយនាមរួម | Full Combined Roster |
| RPT-NUMBER-LIST | បញ្ជីចំនួន | Participant Count List |
| RPT-DELEGATION | តារាងទិន្នន័យក្រុម | Delegation Data Table |
| RPT-SPORT-LIST | ចុះប្រភេទកីឡា | Sport Type List |
| RPT-ALBUM | អាល់ប៊ុមប្រតិភូ | Delegate Photo Album |
| RPT-LEADER-ALL | បញ្ជីថ្នាក់ដឹកនាំ | Full Leadership List |
| RPT-COACH-ATHLETE | គ្រូបង្វឹក + កីឡាករ | Coach + Athlete List |
| RPT-DELEGATION-LEADERS | ប្រតិភូ + អ្នកដឹកនាំក្រុម | Delegation + Team Leaders |

---

## Technical terms for non-technical readers

| Term | What it means in plain language |
|---|---|
| **HttpOnly cookie** | A login token stored in the browser that JavaScript code cannot read — harder to steal |
| **JWT (JSON Web Token)** | A compact encrypted identity card the server issues after login |
| **RBAC** | "Role-Based Access Control" — the system that decides what each user type can see and do |
| **API** | The communication layer between this website and the database server |
| **Zod schema** | A definition of what valid data looks like — prevents bad data from being saved |
| **React Query** | The system that fetches and caches data from the server automatically |
| **OpenAPI** | A standard format for describing what an API can do — used to auto-generate TypeScript types |
| **Cloudinary** | A cloud service that stores uploaded photos and ID documents |
| **CSP (Content Security Policy)** | A security rule that tells the browser which scripts and resources are allowed to run |
| **HSTS** | A security rule that forces HTTPS connections to this website |

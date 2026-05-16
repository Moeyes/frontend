# ប្រព័ន្ធគ្រប់គ្រងព្រឹត្តិការណ៍កីឡាជាតិ
# National Sports Event Management System — v0.5 Beta

**ក្រសួងអប់រំ យុវជន និងកីឡា | Ministry of Education, Youth and Sport**  
**ថ្ងៃទី ២០ ខែឧសភា ឆ្នាំ ២០២៦**

---

## ✅ អ្វីដែលមាននៅ v0.5 Beta (Features available now)

| មុខងារ | Feature |
|---|---|
| ✅ ចូលប្រើប្រាស់ ៤ តួនាទី | 4-role login: Admin, Organization, Federation, Super Admin |
| ✅ ការបង្កើត និងចេញផ្សាយព្រឹត្តិការណ៍ | Event creation, sport attachment, publication |
| ✅ ការដាក់ស្នើបញ្ជីប្រភេទកីឡា | By-sport survey (Organization submits per-sport M/F counts) |
| ✅ ការដាក់ស្នើបញ្ជីចំនួន | By-number survey (per-sport detail: delegate/leader/coach/athlete M/F) |
| ✅ ការចុះឈ្មោះកីឡាករ | Athlete registration with photo + age-based document rule |
| ✅ ការពិនិត្យ និងអនុម័ត | Admin review queue: approve / reject / flag |
| ✅ របាយការណ៍ RPT-3 (ចុះចំនួន) | Numbers per org — Excel + PDF, matching ministry template |
| ✅ របាយការណ៍ RPT-5 (រាយនាមរួម) | Full roster — Excel + PDF with DOB split into ថ្ងៃ/ខែ/ឆ្នាំ |
| ✅ ភាសាខ្មែរ | Full Khmer UI with Battambang font |
| ✅ ការគ្រប់គ្រងអ្នកប្រើប្រាស់ | User management (Admin manages org/fed accounts) |

---

## ⏳ អ្វីដែលនឹងបន្ថែមនៅ v1.0 (Coming in v1.0 — End of May 2026)

| មុខងារ | Feature |
|---|---|
| ⏳ ការដាក់ស្នើប្រភេទតាមប្រកួត | By-category survey (Federation's form) |
| ⏳ ការចុះឈ្មោះប្រធានប្រតិភូ/ដឹកនាំ | Leader & delegate registration |
| ⏳ របាយការណ៍ ៦ ច្បាប់បន្ថែម | 6 more Khmer reports (album, leadership, coaches, etc.) |
| ⏳ ប្រព័ន្ធប័ណ្ណអ្នកចូលរួម | Participant card module |
| ⏳ ការចុះឈ្មោះជាក្រុម CSV | Team registration via CSV upload |
| ⏳ ការ​ផ្ទៀង​ផ្ទាត់​ RBAC​ ពេញ​លេញ | Full cross-tenant security audit |
| ⏳ ការធ្វើ​តេស្ត​ ​1,000​ ​អ្នក​ប្រើ​ | Load testing (1,000 concurrent users) |

---

## 🏗️ ស្ថាបត្យកម្ម (Architecture)

- **Frontend:** Next.js 16 + Tailwind CSS + Khmer (Battambang font)
- **Backend:** Python FastAPI + PostgreSQL
- **Auth:** HttpOnly cookie (secure against XSS)
- **Documents:** Cloudinary (photos, birth certs, IDs)
- **Reports:** Excel (.xlsx) + PDF via browser print

---

## 📅 កាលវិភាគ (Timeline)

| ថ្ងៃខែ | Date | សកម្មភាព | Activity |
|---|---|---|---|
| ២០ ឧសភា ២០២៦ | May 20, 2026 | ✅ Demo v0.5 Beta | Today |
| ២១–៣១ ឧសភា ២០២៦ | May 21–31 | ⏳ Feedback sprint | Apply client feedback |
| ចុងខែឧសភា | End of May | 🚀 v1.0 Production | Full release |

---

## 📞 ទំនាក់ទំនង (Contact)

សំណួរ ឬ មតិ: **satpanha618@gmail.com**

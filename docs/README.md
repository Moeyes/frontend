# National Sports Event Management Platform

**ប្រព័ន្ធគ្រប់គ្រងព្រឹត្តិការណ៍កីឡាជាតិ**  
Cambodia Ministry of Education, Youth and Sport

---

## What this system does

This platform is the official digital back-office for Cambodia's national sports events. Ministry staff use it to create events, attach sports and quotas, and collect participation surveys from federations. Sport federations register their athletes and leaders, upload identity documents, and generate official Excel reports — all in Khmer. Every operation from first event draft to final printed delegation list passes through this system.

---

## Who uses it

| Role | Khmer | What they do |
|---|---|---|
| **Admin** | អ្នកគ្រប់គ្រង | Creates events, manages users, reviews surveys, generates reports |
| **Federation** (`user1`) | សហព័ន្ធ | Submits participation surveys, registers athletes with documents |
| **Organization** (`user2`) | អង្គការ | Registers organizers (coaches, managers, delegates) |
| **Guest** | ភ្ញៀវ | Read-only dashboard access |
| **Super Admin** | (system owner) | Full system access including user administration |

---

## Key features

- **Event lifecycle** — Draft → Publish → Archive, with sports and per-sport organization links
- **Three survey types** — By-sport (per discipline), by-number (totals), by-category (M/F × age)
- **Survey review FSM** — Approve / Reject / Flag with status tracking
- **Participant registration** — Alone mode (with document upload) and Team mode (CSV bulk)
- **Document rules** — Age computed from event date; <18 → birth certificate, ≥18 → NID or passport
- **Organizer registration** — Coaches, managers, delegates, team leads
- **8 Khmer ministry reports** — Excel downloads in Khmer with official column headers
- **Participant ID cards** — Photo cards filterable by event + organization
- **Khmer-first UI** — Full Battambang font, Khmer numerals, Khmer dates
- **RBAC** — Every page and query scoped to the logged-in user's role and organization

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router) + TypeScript |
| UI library | shadcn/ui + Tailwind CSS v4 |
| State — server | TanStack Query (React Query v5) |
| State — forms | React Hook Form + Zod v4 |
| Data tables | TanStack Table v8 |
| i18n | next-intl |
| Auth | HttpOnly cookie-based JWT (via Next.js route handlers) |
| API contract | openapi-typescript (auto-generated from backend OpenAPI) |
| HTTP client | openapi-fetch (typed wrapper) |
| Backend | FastAPI + PostgreSQL (separate repo — read-only contract) |
| File storage | Cloudinary (presigned upload) |
| Package manager | pnpm |
| Test runner | Vitest + @testing-library/react |

---

## Status

| Version | Stage | Date |
|---|---|---|
| v0.4-beta | Internal beta | Week 4 of 8-week rebuild |
| v0.6-pilot | Pilot (3–5 real federations) | Week 6 |
| **v1.0** | **Production** | **Week 8** |

Current: **v1.0 production** — all 13 modules, all 8 reports, security hardened.

---

## Links

- [Architecture overview](./ARCHITECTURE.md)
- [Getting started (new developer)](./GETTING_STARTED.md)
- [All 13 modules](./MODULES.md)
- [8 Khmer reports](./REPORTS.md)
- [Security model](./SECURITY.md)
- [Full documentation index](./INDEX.md)
- Backend contract: `_contract/ENDPOINTS.md` (42 paths, 53 methods)
- Rebuild decisions: `_rebuild/02_DECISIONS.md`

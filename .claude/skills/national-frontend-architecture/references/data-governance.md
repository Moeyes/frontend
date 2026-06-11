# Data Governance Reference — Strict Data Handling

This system processes personal data of citizens and athletes (including, potentially, **minors**
in youth competitions) and official public records. Mishandling data is a defect with legal and
human consequences. These rules govern how the frontend classifies, displays, caches, and
transmits data.

## Table of contents

1. [Data classification](#1-data-classification)
2. [Data minimization](#2-data-minimization)
3. [PII handling rules](#3-pii-handling-rules)
4. [Masking & display](#4-masking--display)
5. [Caching & client-side persistence](#5-caching--client-side-persistence)
6. [Telemetry, analytics & logging](#6-telemetry-analytics--logging)
7. [Retention, residency & erasure](#7-retention-residency--erasure)
8. [Minors & special-category data](#8-minors--special-category-data)
9. [Data-governance checklist](#9-data-governance-checklist)

---

## 1. Data classification

Classify every field the frontend handles. The classification drives caching, masking, and
logging decisions.

| Class            | Examples                                                            | Frontend handling |
| ---------------- | ------------------------------------------------------------------- | ----------------- |
| **Public**       | Event name, public schedule, published results                      | Normal caching OK |
| **Internal**     | Draft events, internal notes, non-personal config                   | Cache OK; not in URLs you'd share |
| **Confidential** | Org contacts, internal contact emails, financials                   | Short cache; never in logs/telemetry |
| **Restricted-PII** | National ID, passport, DOB, address, phone, photo, medical/eligibility, anything about a minor | **No caching, no logs, no URLs, mask by default, minimum exposure** |

When a field's class is unclear, treat it as the **higher** sensitivity.

---

## 2. Data minimization

- Request and render only the fields the screen actually needs. A list view of participants
  should not pull full national IDs or medical data — define a lean list DTO in the port.
- Define **separate port methods / DTOs** for summary vs detail so PII isn't fetched to render a
  table. `getList()` returns masked/lean records; `getById()` returns detail only when a user
  with the capability opens it.
- Never "fetch everything and filter on the client" for Restricted-PII — filtering happens
  server-side so PII never reaches a browser that shouldn't have it.

---

## 3. PII handling rules

PII = anything identifying a person: name, national ID, passport, DOB, address, phone, email,
photo, biometric, health/eligibility data, and any combination that re-identifies someone.

- **Never place PII in:** URLs, query strings, route params used for navigation history,
  `console`, analytics events, error messages, toast text, or client-side logs.
- **Never store PII in:** `localStorage`, `sessionStorage`, IndexedDB, Zustand, or any state that
  outlives the screen. Keep it in TanStack Query with `staleTime: 0` + `gcTime: 0` so it is not
  retained after unmount.
- Pass PII in **request bodies**, not URLs. Search by national ID → `POST /participants/search`
  with the value in the body, not `GET /participants?nid=...`.
- Clear PII-bearing query cache on logout (`queryClient.clear()` in `core/auth/` sign-out).

---

## 4. Masking & display

- Mask Restricted-PII by default; reveal only on an explicit, permission-gated action that the
  server authorizes and audits.
- Provide a shared masking utility in `shared/utils` (e.g. `maskNationalId`, `maskPhone`) so
  masking is consistent and testable. Do the masking on values already minimized by the server
  where possible; client masking is a display safeguard, not the primary control.

```tsx
// list view — masked
<span>{maskNationalId(p.nationalId)}</span>   // 12••••••89
// detail view — revealed only behind a capability + audited fetch
{can('participants.viewPii') && <span>{detail.nationalId}</span>}
```

- Never put PII in `alt` text, `title` attributes, `aria-label`s that get announced broadly, or
  image filenames.

---

## 5. Caching & client-side persistence

| Data class       | TanStack `staleTime` / `gcTime`       | Persist to disk? |
| ---------------- | ------------------------------------- | ---------------- |
| Public / static  | per architecture defaults             | OK (build-time)  |
| Confidential     | short stale, default gc               | No               |
| Restricted-PII   | `staleTime: 0`, `gcTime: 0`           | **Never**        |

- Do not enable TanStack Query **persistence** plugins for any cache that can hold PII.
- Service workers / PWA caches must exclude PII responses.
- On logout, call `queryClient.clear()` and ensure no PII remains in memory or storage.

---

## 6. Telemetry, analytics & logging

- Analytics events carry **no PII** — no names, IDs, emails, or free-text that users typed.
  Send opaque event names and non-identifying counts only.
- Page-view tracking must strip PII from URLs (and PII should never have been in the URL — §3).
- Error/crash reporting (if any) must scrub request bodies, headers, and PII before sending;
  prefer server-side reporting where the scrubbing is enforced.
- No `console.*` of data objects in production paths (also a security rule).

---

## 7. Retention, residency & erasure

- **Data residency / sovereignty:** the frontend talks only to approved in-jurisdiction
  endpoints (configured in `core/config`). Do not introduce third-party scripts, fonts, or CDNs
  that would route citizen data outside the approved jurisdiction without explicit approval.
- The browser is **not** a system of record. Don't build features that rely on long-lived
  client storage of records; the server retains, the client displays.
- Support **right-to-erasure** flows by never creating hidden client copies that survive a
  delete — after a delete mutation, invalidate and clear related caches.

---

## 8. Minors & special-category data

- Youth-competition data may concern **minors**; treat all of it as Restricted-PII at minimum.
- Apply the strictest handling: maximum masking, minimum fetching, no caching, no telemetry, and
  permission-gated + audited reveal.
- Never display a minor's contact details, address, or photo in any view that isn't strictly
  permission-gated and necessary.

---

## 9. Data-governance checklist

Run before completing any task that reads, displays, transmits, or stores data.

- [ ] Every field handled is classified; ambiguous fields treated as more sensitive.
- [ ] The screen fetches only the fields it needs (lean list DTO vs detail DTO).
- [ ] No Restricted-PII filtering done on the client — server filters it.
- [ ] No PII in URLs, query strings, logs, toasts, error messages, or analytics.
- [ ] No PII in `localStorage`/`sessionStorage`/Zustand; PII queries use `staleTime:0`+`gcTime:0`.
- [ ] Restricted-PII is masked by default; reveal is permission-gated + server-audited.
- [ ] No PII cache persistence (no persist plugin / SW cache of PII).
- [ ] `queryClient.clear()` runs on logout.
- [ ] No third-party script/CDN/font that routes data out of the approved jurisdiction.
- [ ] Any data about minors handled at the strictest tier.

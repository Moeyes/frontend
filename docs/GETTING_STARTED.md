# Getting Started

This guide gets you from zero to a running local development environment in under 30 minutes.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20 | https://nodejs.org |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Git | any | system package manager |
| PostgreSQL | ≥ 14 | needed for backend only |
| Python | ≥ 3.11 | needed for backend only |

**Note:** The frontend can run without the backend — just set `NEXT_PUBLIC_API_URL` to point to the staging backend.

---

## Clone and install

```bash
git clone <repo-url>
cd <repo>/final

# Install frontend dependencies
pnpm install
```

---

## Environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

`.env` contents:

```dotenv
# URL of the FastAPI backend (local or staging)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Public URL of this frontend (used for CORS, links in emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary cloud name for file uploads
# Get from your Cloudinary dashboard → Settings → General
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

All env vars are validated at startup by `env.ts` (Zod schema). The server will refuse to start with a missing `NEXT_PUBLIC_API_URL`.

---

## Running the backend locally

The backend lives in a separate repo owned by your teammate. To run it:

```bash
# In the backend repo directory
cd Backend-V2
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify it's up: `curl http://localhost:8000/api/openapi.json`

Alternatively, set `NEXT_PUBLIC_API_URL` to the shared staging backend to skip this step.

---

## Running the frontend

```bash
pnpm dev
```

Open http://localhost:3000. You should see the login page in Khmer.

**Default seed credentials** (ask a teammate for staging credentials):

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `<ask teammate>` |
| Federation | `fed_test` | `<ask teammate>` |
| Organization | `org_test` | `<ask teammate>` |

---

## Syncing the API contract

After any backend change, regenerate the TypeScript types:

```bash
pnpm contract:sync
```

This runs:
1. `curl` to fetch `openapi.json` from the running backend
2. `openapi-typescript` to generate `_contract/api.types.ts`

Always commit the updated `_contract/api.types.ts` together with any frontend changes that depend on the new types.

---

## Running tests

```bash
# Run all tests once
pnpm test:run

# Run in watch mode (re-runs on file change)
pnpm test

# Run with coverage report
pnpm test:coverage
```

All tests are in `__tests__/` directories co-located with the code they test. See [TESTING.md](./TESTING.md) for details.

---

## Build for production

```bash
pnpm build
pnpm start
```

The build fails if TypeScript has errors. This is intentional — TypeScript is your CI gate.

---

## Lint

```bash
pnpm lint
```

---

## First-day tasks

Do these in order on your first day:

### 1. Read (30 min)

1. This file (done)
2. [ARCHITECTURE.md](./ARCHITECTURE.md) — understand the request flow
3. [MODULES.md](./MODULES.md) — know what each module does
4. [AUTH_AND_RBAC.md](./AUTH_AND_RBAC.md) — understand the 5 roles
5. `_rebuild/SCENARIOS.md` — the 10 user journeys the system supports

### 2. Run (10 min)

```bash
# Confirm TypeScript is happy
pnpm tsc --noEmit

# Confirm tests pass
pnpm test:run

# Confirm the app builds
pnpm build
```

### 3. Explore (20 min)

Log in as three different roles and observe what changes:
- Login as **Admin** → see all sidebar items, open Events, create a test event
- Login as **Federation** → see only Surveys and Registration; try submitting a survey
- Login as **Organization** → see only Participation

### 4. Find your first issue

Check the issue tracker for issues labelled `good-first-issue`. Most first-day tasks involve adding a missing field to a form or fixing a translation.

---

## Common first-day problems

| Problem | Fix |
|---|---|
| `pnpm: command not found` | `npm install -g pnpm` then restart terminal |
| `Invalid environment variables` | Copy `.env.example` to `.env` and fill in `NEXT_PUBLIC_API_URL` |
| Login fails immediately | Backend is not running. Set `NEXT_PUBLIC_API_URL` to staging URL |
| Khmer text shows boxes | Battambang font not loaded — check network requests for font failures |
| `pnpm tsc --noEmit` fails | Run `pnpm contract:sync` first if types are stale |

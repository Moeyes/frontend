# Testing Guide

## Test pyramid

```
         ╱╲         E2E (Playwright) — full user journeys
        ╱  ╲        10 scenarios from SCENARIOS.md
       ╱────╲
      ╱  Component ╲  React Testing Library — UI interactions
     ╱    Tests     ╲  (planned for Phase 2)
    ╱────────────────╲
   ╱   Integration    ╲  Auth route handlers, API client middleware
  ╱      Tests         ╲
 ╱────────────────────────╲
╱       Unit Tests          ╲  Pure functions, Zod schemas, i18n parity
╲────────────────────────────╱  ← most tests live here
```

**Current status:** Unit + integration tests written. Component and E2E tests are planned (Phase 2 of test rollout). See [AUDIT_QA_2026-05-11.md](../_rebuild/AUDIT_QA_2026-05-11.md).

---

## Test runner

Vitest 4.x — ESM-native, fast cold starts, compatible with the project's Node.js + TypeScript setup.

```bash
pnpm test          # watch mode (re-runs on change)
pnpm test:run      # one-shot (CI mode)
pnpm test:coverage # one-shot + coverage report
```

---

## How to run specific tests

```bash
# Run a single file
pnpm test:run core/lib/__tests__/format.test.ts

# Run files matching a pattern
pnpm test:run --reporter=verbose

# Run tests with a specific name
pnpm test:run -t "computeAgeAtEvent"
```

---

## How to write a unit test

Unit tests for pure functions go in `__tests__/` next to the file they test.

**Example:** testing `computeAgeAtEvent`

```ts
// core/lib/__tests__/format.test.ts
import { describe, it, expect } from 'vitest';
import { computeAgeAtEvent } from '../format';

describe('computeAgeAtEvent', () => {
  it('returns null when dob is null', () => {
    expect(computeAgeAtEvent(null, '2024-01-01')).toBeNull();
  });

  it('birthday IS the event day → age counts as new age (adult)', () => {
    expect(computeAgeAtEvent('2000-01-15', '2018-01-15')).toBe(18);
  });

  it('one day before birthday → still previous age (minor)', () => {
    expect(computeAgeAtEvent('2000-01-15', '2018-01-14')).toBe(17);
  });
});
```

**Unit test rules:**
- No network calls, no file I/O, no React
- Test one function per `describe` block
- Test boundary conditions, not just happy path
- Name tests as sentences describing the expected behaviour

---

## How to write a Zod schema test

Zod schemas are pure functions — test them the same way as utility functions:

```ts
// modules/events/services/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest';
import { eventSchema } from '../schema';

describe('eventSchema — date range refinement', () => {
  const base = { name_kh: 'Test Event', type: 'កីឡាជាតិ' };

  it('rejects end_date before start_date', () => {
    const result = eventSchema.safeParse({
      ...base,
      start_date: '2025-12-31',
      end_date:   '2025-01-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('end_date');
    }
  });
});
```

---

## How to write an integration test

Integration tests for Next.js route handlers run in Node environment with a mocked `fetch`:

```ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const MOCK_TOKEN = 'eyJ...'; // fake JWT

describe('POST /api/auth/login', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('valid credentials → sets HttpOnly access_token', async () => {
    const { POST } = await import('../login/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ access_token: MOCK_TOKEN, refresh_token: 'rt' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'password' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const setCookies = res.headers.getSetCookie();
    const atCookie = setCookies.find(c => c.startsWith('access_token='));

    expect(res.status).toBe(200);
    expect(atCookie?.toLowerCase()).toContain('httponly');
  });
});
```

---

## How to write a component test (planned)

Component tests use React Testing Library with `happy-dom` environment. Add `// @vitest-environment happy-dom` at the top of the file.

```ts
// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

// Required providers wrapper
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

describe('MyComponent', () => {
  it('shows error when name is empty', async () => {
    render(<MyComponent />, { wrapper: Providers });
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

---

## i18n parity test (automated, runs every CI)

```ts
// core/lib/__tests__/i18n-parity.test.ts
// Runs in node environment. Reads message files and compares key sets.
// Fails if en.json and kh.json have different key counts.
```

This is the most important CI guard for Khmer translations. Never suppress it.

---

## Coverage thresholds

Configured in `vitest.config.ts`:

```ts
coverage: {
  include: ['core/lib/**', 'modules/*/services/schema.ts', 'app/api/auth/**'],
  thresholds: {
    lines:     70,
    branches:  60,
    functions: 70,
  },
}
```

The CI build fails if coverage drops below these thresholds on the critical modules.

---

## CI integration

Tests run on every PR via GitHub Actions (`.github/workflows/test.yml`):

```yaml
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm test:run
      - run: pnpm build
```

All four steps must pass before a PR can merge.

---

## Manual QA checklist

Run this before every production release. See [OPERATIONS.md § Release checklist](./OPERATIONS.md#release-checklist) for the full list.

| Check | Who | When |
|---|---|---|
| Khmer font renders (no tofu boxes) | QA engineer | Every release |
| Excel Khmer reports open correctly | QA engineer | Every release |
| Login as all 4 roles | QA engineer | Every release |
| Survey → review → approve full loop | Ministry tester | Every release |
| Registration with document upload | Ministry tester | Every release |
| Mobile view (375px sidebar collapse) | QA engineer | Every release |

See [AUDIT_QA_2026-05-11.md](../_rebuild/AUDIT_QA_2026-05-11.md) for the full manual test plan with expected outcomes and pass criteria.

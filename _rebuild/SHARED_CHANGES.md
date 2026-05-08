# Shared Layer Changes

Deviations from the original stencil, documented per CONVENTIONS.md.

---

## shared/form/TextInputField.tsx

**Change:** Added `rightElement?: ReactNode` prop and `autoComplete`, `autoFocus` pass-through props.

**Why:** The login form requires a password show/hide toggle button overlaid on the input. This is a common pattern (search icon, clear button, unit suffix) that belongs on the shared component rather than being worked around per-module.

**How it works:** When `rightElement` is provided, the input is wrapped in a relative container and the element is positioned absolutely on the right with `inset-y-0 right-0`. The input gets `pr-10` to prevent text from running under the element.

**Module that requested it:** `auth` (Login Form password toggle).

---

## shared/layout/PageShell.tsx, Sidebar.tsx, TopBar.tsx

**Status:** Superseded by `common` module. No code changes to these files; they remain as stubs.

**Why:** The `common` module (Week 2 Tue) owns the portal layout shell. `modules/common/CommonLayout` replaces `shared/layout/PageShell` as the layout used in `app/(portal)/layout.tsx`. The Sidebar and TopBar implementations now live in `modules/common/components/Sidebar.tsx` and `TopBar.tsx`.

The `shared/layout/` versions are kept to avoid breaking any import that may reference them from outside the portal (e.g., storybook, tests). They are functionally identical to the common module versions.

**Module that requested it:** `common`.

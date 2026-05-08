# Shared Layer Changes

Deviations from the original stencil, documented per CONVENTIONS.md.

---

## shared/form/TextInputField.tsx

**Change:** Added `rightElement?: ReactNode` prop and `autoComplete`, `autoFocus` pass-through props.

**Why:** The login form requires a password show/hide toggle button overlaid on the input. This is a common pattern (search icon, clear button, unit suffix) that belongs on the shared component rather than being worked around per-module.

**How it works:** When `rightElement` is provided, the input is wrapped in a relative container and the element is positioned absolutely on the right with `inset-y-0 right-0`. The input gets `pr-10` to prevent text from running under the element.

**Module that requested it:** `auth` (Login Form password toggle).

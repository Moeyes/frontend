// Domain-local UI types ONLY.
// Never redefine backend response shapes here — those come from:
//   import type { components } from '@/_contract/api.types';
//
// Valid contents:
//   - UI state enums (e.g. form steps, badge variants)
//   - Derived/composed types used only within this module's components
//   - Props interfaces for complex components

// Example:
// export type DOMAINFormStep = 'personal' | 'documents' | 'review';
// export type DOMAINStatusBadge = 'success' | 'warning' | 'destructive' | 'outline';

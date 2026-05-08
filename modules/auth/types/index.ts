// UI-only types for the auth module.
// Backend types come from core/auth (which uses _contract/api.types.ts).

export type LoginStep = 'idle' | 'submitting' | 'success' | 'error';

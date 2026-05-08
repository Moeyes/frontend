// Auth API calls are handled by core/auth/AuthContext via Next.js route handlers
// (app/api/auth/login|logout|refresh). The typed API client is not used here because
// these are Next.js BFF routes, not direct backend calls.
//
// This file re-exports form types for use across the module.
export type { LoginFormValues } from './schema';

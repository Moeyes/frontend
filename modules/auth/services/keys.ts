// Auth has no server-side list queries — only the session fetch is handled by AuthContext.
// This file exists to satisfy the module template convention.
export const authKeys = {
  session: (userId: string) => ['auth', 'session', userId] as const,
} as const;

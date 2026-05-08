export const reportKeys = {
  all:     () => ['reports'] as const,
  roster:  (orgId: number, eventId: number) => [...reportKeys.all(), 'roster',  orgId, eventId] as const,
  numbers: (orgId: number, eventId: number) => [...reportKeys.all(), 'numbers', orgId, eventId] as const,
} as const;

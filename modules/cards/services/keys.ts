export const cardKeys = {
  all:    () => ['cards'] as const,
  list:   (orgId: number, eventId: number) => [...cardKeys.all(), 'list', orgId, eventId] as const,
  detail: (pId: string, orgId: number, eventId: number) =>
    [...cardKeys.all(), 'detail', pId, orgId, eventId] as const,
} as const;

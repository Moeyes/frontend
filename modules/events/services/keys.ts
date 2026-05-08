export const eventKeys = {
  all:    () => ['events'] as const,
  lists:  () => [...eventKeys.all(), 'list'] as const,
  list:   (params: object) => [...eventKeys.lists(), params] as const,
  detail: (id: number) => [...eventKeys.all(), 'detail', id] as const,
  sports: (eventId: number) => [...eventKeys.detail(eventId), 'sports'] as const,
  orgs:   (eventId: number) => [...eventKeys.detail(eventId), 'orgs'] as const,
  sportOrgs: (eventId: number, sportId: number) =>
    [...eventKeys.sports(eventId), sportId, 'orgs'] as const,
} as const;

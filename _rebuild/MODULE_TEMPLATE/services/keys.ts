// Replace DOMAIN with your module name (e.g. 'events', 'survey', 'registration')
const DOMAIN = 'REPLACE_ME';

export const DOMAIN_keys = {
  all:    () => [DOMAIN] as const,
  lists:  () => [...DOMAIN_keys.all(), 'list'] as const,
  list:   (params: object) => [...DOMAIN_keys.lists(), params] as const,
  detail: (id: number) => [...DOMAIN_keys.all(), 'detail', id] as const,
} as const;

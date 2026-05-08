export const sportKeys = {
  all:    () => ['sports'] as const,
  lists:  () => [...sportKeys.all(), 'list'] as const,
  list:   (params: object) => [...sportKeys.lists(), params] as const,
  detail: (id: number) => [...sportKeys.all(), 'detail', id] as const,
  categories: (eventId: number, sportId: number) =>
    [...sportKeys.detail(sportId), 'categories', eventId] as const,
} as const;

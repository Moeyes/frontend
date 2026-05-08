export const regKeys = {
  all:    () => ['registration'] as const,
  lists:  () => [...regKeys.all(), 'list'] as const,
  list:   (params: object) => [...regKeys.lists(), params] as const,
  detail: (id: number) => [...regKeys.all(), 'detail', id] as const,
} as const;

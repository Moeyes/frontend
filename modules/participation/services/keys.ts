export const participationKeys = {
  all:    () => ['participation'] as const,
  lists:  () => [...participationKeys.all(), 'list'] as const,
  list:   (params: object) => [...participationKeys.lists(), params] as const,
  detail: (id: number) => [...participationKeys.all(), 'detail', id] as const,
} as const;

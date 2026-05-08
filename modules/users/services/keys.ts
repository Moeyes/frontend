export const userKeys = {
  all:    () => ['users'] as const,
  lists:  () => [...userKeys.all(), 'list'] as const,
  list:   (params: object) => [...userKeys.lists(), params] as const,
  detail: (id: string) => [...userKeys.all(), 'detail', id] as const,
} as const;

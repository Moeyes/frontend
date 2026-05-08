export const orgKeys = {
  all:    () => ['organizations'] as const,
  lists:  () => [...orgKeys.all(), 'list'] as const,
  list:   (params: object) => [...orgKeys.lists(), params] as const,
  detail: (id: number) => [...orgKeys.all(), 'detail', id] as const,
} as const;

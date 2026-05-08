export const submissionKeys = {
  all:    () => ['submissions'] as const,
  lists:  () => [...submissionKeys.all(), 'list'] as const,
  list:   (params: object) => [...submissionKeys.lists(), params] as const,
  detail: (id: number) => [...submissionKeys.all(), 'detail', id] as const,
} as const;

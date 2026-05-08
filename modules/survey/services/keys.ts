export const surveyKeys = {
  all:    () => ['survey'] as const,
  lists:  () => [...surveyKeys.all(), 'list'] as const,
  list:   (params: object) => [...surveyKeys.lists(), params] as const,
  detail: (id: number) => [...surveyKeys.all(), 'detail', id] as const,
} as const;

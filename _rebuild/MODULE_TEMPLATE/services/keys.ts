export const exampleKeys = {
  all:    () => ['MODULE_NAME'] as const,
  lists:  () => [...exampleKeys.all(), 'list'] as const,
  list:   (params: object) => [...exampleKeys.lists(), params] as const,
  detail: (id: number) => [...exampleKeys.all(), 'detail', id] as const,
}

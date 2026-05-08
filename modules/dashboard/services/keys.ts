export const dashboardKeys = {
  all:  () => ['dashboard'] as const,
  data: () => [...dashboardKeys.all(), 'data'] as const,
} as const;

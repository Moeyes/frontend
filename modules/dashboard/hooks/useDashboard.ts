import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../services/dashboard.service';
import { dashboardKeys } from '../services/keys';

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn:  getDashboard,
    staleTime: 60_000, // dashboard data is low-churn; re-fetch every 60s
  });
}

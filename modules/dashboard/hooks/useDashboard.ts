'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { dashboardHttpAdapter } from '../adapters/dashboardHttpAdapter';
import { useAuth, UserRole } from '@/core/auth';

export function useDashboard() {
    const { user, role } = useAuth();
    const orgId = user?.organization_id ?? user?.org_id;

    return useQuery({
        queryKey: queryKeys.dashboard.scoped(role, orgId),
        queryFn: () => {
            const params: { orgId?: number; categoryId?: number } = {};
            if (role === UserRole.ORGANIZATION && orgId) {
                params.orgId = orgId;
            }
            return dashboardHttpAdapter.getDashboardData(params);
        },
        enabled: !!user,
        staleTime: 60000,
    });
}

/**
 * useDashboard Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getDashboardData } from '../services';
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

            // Federation users get a category-level view
            // (category filtering is handled separately / as its own param).

            return getDashboardData(params);
        },
        enabled: !!user,
        staleTime: 60000, // 60 seconds as requested
    });
}

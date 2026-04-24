/**
 * useDashboard Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../services';
import { useAuth, UserRole } from '@/core/auth';

export function useDashboard() {
    const { user, role } = useAuth();

    return useQuery({
        queryKey: ['dashboard', role, user?.org_id],
        queryFn: () => {
            const params: { orgId?: number; categoryId?: number } = {};
            
            if (role === UserRole.ORGANIZATION && user?.org_id) {
                params.orgId = user.org_id;
            }
            
            // USER2 = FEDERATION, for category-level view
            // (Assumes category filtering might be handled differently or as a separate param)
            
            return getDashboardData(params);
        },
        enabled: !!user,
        staleTime: 60000, // 60 seconds as requested
    });
}

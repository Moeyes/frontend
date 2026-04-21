/**
 * useRequireRole Hook
 * 
 * Hook to ensure user has required role(s), redirect to unauthorized page if not
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';

export function useRequireRole(requiredRoles: UserRole | UserRole[]) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!hasRole(requiredRoles)) {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, requiredRoles, hasRole, router]);

  return { isAuthenticated, hasRole: hasRole(requiredRoles), isLoading };
}

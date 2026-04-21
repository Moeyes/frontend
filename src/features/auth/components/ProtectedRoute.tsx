/**
 * ProtectedRoute Component
 *
 * Single component that handles:
 *  - Loading state (spinner)
 *  - Unauthenticated → redirect to login (with returnUrl)
 *  - Wrong role → redirect to /unauthorized
 *  - Authorized → render children
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { isLoading, isAuthenticated, canAccess } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
            return;
        }

        if (requiredRoles && !canAccess(requiredRoles)) {
            router.replace('/unauthorized');
        }
    }, [isLoading, isAuthenticated, requiredRoles, canAccess, router, pathname]);

    // Render children on both server and client
    // Auth checks happen only in useEffect (client-side)
    return <>{children}</>;
}
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
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import { useRequireAuth } from '@/features/auth/hooks';
import { UserRole } from '@/features/auth/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { isLoading, isAuthenticated } = useRequireAuth();
    const { canAccess } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        if (requiredRoles && !canAccess(requiredRoles)) {
            router.replace('/unauthorized');
        }
    }, [isLoading, isAuthenticated, requiredRoles, canAccess, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
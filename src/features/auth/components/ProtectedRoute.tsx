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

    // Show spinner while auth state is loading OR while redirect is pending
    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Role check failed — show nothing while redirect fires
    if (requiredRoles && !canAccess(requiredRoles)) {
        return null;
    }

    return <>{children}</>;
}
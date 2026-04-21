/**
 * Portal Layout
 *
 * Wraps all portal routes. Each page declares its own required roles
 * via the ProtectedRoute component so the layout stays clean.
 */

'use client';

import { ProtectedRoute } from '@/features/auth/components';
import { UserRole } from '@/features/auth/types';

// All portal routes require at least being logged in
const PORTAL_ROLES: UserRole[] = [
    UserRole.ADMIN,
    UserRole.ORGANIZATION,
    UserRole.FEDERATION,
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute requiredRoles={PORTAL_ROLES}>
            {children}
        </ProtectedRoute>
    );
}
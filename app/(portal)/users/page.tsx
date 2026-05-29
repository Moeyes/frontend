'use client';

import { useRequireRole, UserRole } from '@/core/auth';
import { PageLoadingState } from '@/shared';
import { UsersPage } from '@/modules/users';

export default function Page() {
    const { isLoading, hasRole } = useRequireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

    if (isLoading) {
        return <PageLoadingState />;
    }

    if (!hasRole) return null;

    return <UsersPage />;
}

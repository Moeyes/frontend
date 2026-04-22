'use client';

import { UserList } from '@/features/users';
import { useRequireRole } from '@/features/auth/hooks';
import { UserRole } from '@/features/auth/types';

/**
 * User Management Page
 * 
 * Accessible only by administrators
 */
export default function UsersPage() {
    // 🛡️ Security: Guard this page with admin role
    const { isLoading, hasRole } = useRequireRole([UserRole.ADMIN]);

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!hasRole) return null; // Redirection handled by hook

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UserList />
        </div>
    );
}

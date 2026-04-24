'use client';

import { useRequireRole, UserRole } from '@/core/auth';
import { ByCategoryPage } from '@/modules/common';

export default function Page() {
    useRequireRole([UserRole.FEDERATION, UserRole.ADMIN]);
    return <ByCategoryPage />;
}

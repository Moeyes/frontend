'use client';

import { useRequireRole, UserRole } from '@/core/auth';
import { ParticipationPage } from '@/modules/participation';

export default function Page() {
    useRequireRole([UserRole.ADMIN, UserRole.ORGANIZATION]);
    return <ParticipationPage />;
}

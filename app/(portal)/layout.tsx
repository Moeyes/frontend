import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/core/auth';
import { CommonLayout } from '@/modules/common';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'user1', 'user2', 'guest']}>
      <CommonLayout>{children}</CommonLayout>
    </ProtectedRoute>
  );
}

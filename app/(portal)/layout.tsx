import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/core/auth';
import { PageShell } from '@/shared/layout';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'user1', 'user2', 'guest']}>
      <PageShell>{children}</PageShell>
    </ProtectedRoute>
  );
}

'use client';

import { useRequireRole, FEATURE_ACCESS } from '@/core/auth';
import { PageLoadingState } from '@/shared';
import { ByNumberPage } from '@/modules/bynumber';

export default function Page() {
  const { isLoading, hasRole } = useRequireRole(FEATURE_ACCESS.bynumber);

  if (isLoading) return <PageLoadingState />;
  if (!hasRole) return null;

  return <ByNumberPage />;
}

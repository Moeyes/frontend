'use client';

import { useRequireRole, FEATURE_ACCESS } from '@/core/auth';
import { PageLoadingState } from '@/shared';
import { EventsPage } from '@/modules/events';

export default function Page() {
  const { isLoading, hasRole } = useRequireRole(FEATURE_ACCESS.events);

  if (isLoading) return <PageLoadingState />;
  if (!hasRole) return null;

  return <EventsPage />;
}

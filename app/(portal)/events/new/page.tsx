'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/core/auth';
import { PageHeader, BackLink } from '@/shared/ui';
import { EventForm } from '@/modules/events';
import { ROUTES } from '@/core/config';

export default function EventNewRoute() {
  const t = useTranslations('events');
  const router = useRouter();

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="space-y-4">
        <BackLink href={ROUTES.events.list} label={t('backToEvents')} />
        <PageHeader title={t('createNewEvent')} />
        <EventForm
          mode="create"
          onSuccess={(event) => router.push(ROUTES.events.detail(event.id))}
        />
      </div>
    </ProtectedRoute>
  );
}

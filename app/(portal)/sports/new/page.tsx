'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/core/auth';
import { PageHeader, BackLink } from '@/shared/ui';
import { SportForm } from '@/modules/sports';
import { ROUTES } from '@/core/config';

export default function SportNewRoute() {
  const t = useTranslations('sports');
  const router = useRouter();

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="space-y-4">
        <BackLink href={ROUTES.sports.list} label={t('backToSports')} />
        <PageHeader title={t('createNewSport')} />
        <SportForm onSuccess={(s) => router.push(ROUTES.sports.detail(s.id))} />
      </div>
    </ProtectedRoute>
  );
}

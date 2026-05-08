'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/core/auth';
import { useAuth } from '@/core/auth';
import { PageHeader, BackLink } from '@/shared/ui';
import { OrganizerForm } from '@/modules/participation';
import { ROUTES } from '@/core/config';

export default function ParticipationNewRoute() {
  const t      = useTranslations('participation');
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['user2']}>
      <div className="space-y-4">
        <BackLink href={ROUTES.participation.home} label={t('backToList')} />
        <PageHeader title={t('createTitle')} />
        <OrganizerForm
          organizationId={user?.organization_id ?? null}
          onSuccess={() => router.push(ROUTES.participation.home)}
        />
      </div>
    </ProtectedRoute>
  );
}

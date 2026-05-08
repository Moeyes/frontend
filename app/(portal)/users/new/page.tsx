'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/core/auth';
import { PageHeader, BackLink } from '@/shared/ui';
import { UserForm } from '@/modules/users';
import { ROUTES } from '@/core/config';

export default function UserNewRoute() {
  const t = useTranslations('users');
  const router = useRouter();

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="space-y-4">
        <BackLink href={ROUTES.users.list} label={t('backToList')} />
        <PageHeader title={t('createNewUser')} />
        <UserForm mode="create" onSuccess={() => router.push(ROUTES.users.list)} />
      </div>
    </ProtectedRoute>
  );
}

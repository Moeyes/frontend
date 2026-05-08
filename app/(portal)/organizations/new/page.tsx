'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/core/auth';
import { PageHeader, BackLink } from '@/shared/ui';
import { OrganizationForm } from '@/modules/organizations';
import { ROUTES } from '@/core/config';

export default function OrganizationNewRoute() {
  const t = useTranslations('organizations');
  const router = useRouter();

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="space-y-4">
        <BackLink href={ROUTES.organizations.list} label={t('backToOrganizations')} />
        <PageHeader title={t('createNewOrganization')} />
        <OrganizationForm
          mode="create"
          onSuccess={(org) => router.push(ROUTES.organizations.detail(org.id))}
        />
      </div>
    </ProtectedRoute>
  );
}

'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { QueryBoundary, PageHeader, BackLink } from '@/shared/ui';
import { ROUTES } from '@/core/config';
import { useOrganization } from '../hooks/useOrganization';
import { OrganizationForm } from './OrganizationForm';

interface OrganizationDetailPageProps {
  orgId: number;
}

export function OrganizationDetailPage({ orgId }: OrganizationDetailPageProps) {
  const t      = useTranslations('organizations');
  const router = useRouter();
  const query  = useOrganization(orgId);

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.organizations.list} label={t('backToOrganizations')} />
      <PageHeader title={t('editOrganization')} />

      <QueryBoundary query={query}>
        {(org) => (
          <OrganizationForm
            mode="edit"
            org={org}
            onSuccess={() => router.push(ROUTES.organizations.list)}
          />
        )}
      </QueryBoundary>
    </div>
  );
}

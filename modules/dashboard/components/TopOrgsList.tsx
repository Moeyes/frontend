'use client';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, PageEmptyState } from '@/shared/ui';
import type { TopOrganization } from '../services/dashboard.service';

interface TopOrgsListProps {
  orgs: TopOrganization[];
}

export function TopOrgsList({ orgs }: TopOrgsListProps) {
  const t = useTranslations('dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('topOrganizations')}</CardTitle>
      </CardHeader>
      <CardContent>
        {orgs.length === 0 ? (
          <PageEmptyState message={t('noOrganizationData')} />
        ) : (
          <ul className="divide-y">
            {orgs.map((org, i) => (
              <li key={i} className="py-3 flex items-center justify-between gap-4">
                <p className="text-sm font-medium truncate">{org.name_kh}</p>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {org.participant_count} {t('members')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

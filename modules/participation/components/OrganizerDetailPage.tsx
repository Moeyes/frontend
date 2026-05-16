'use client';
import { useTranslations } from 'next-intl';
import { QueryBoundary, PageHeader, BackLink, Card, CardContent } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { LeaderRoleBadge } from './LeaderRoleBadge';
import { useRegistration } from '@/modules/registration-flow';

interface OrganizerDetailPageProps {
  enrollId: number;
}

export function OrganizerDetailPage({ enrollId }: OrganizerDetailPageProps) {
  const t  = useTranslations('participation');
  const tc = useTranslations('common');
  const { locale } = useLanguage();

  const query = useRegistration(enrollId, 'leader');

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.participation.home} label={t('backToList')} />
      <PageHeader title={t('createTitle')} />

      <QueryBoundary query={query}>
        {(record) => (
          <div className="space-y-4 max-w-xl">
            <Card>
              <CardContent className="pt-5 space-y-3">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{tc('role')}</dt>
                    <dd>
                      <LeaderRoleBadge role={record.leader_role ?? null} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('columns.sport')}</dt>
                    <dd className="font-medium tabular-nums">
                      {record.sport_id ? `#${record.sport_id}` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{tc('male') + ' / ' + tc('female')}</dt>
                    <dd className="font-medium">
                      {record.gender === 'MALE' ? tc('male') : record.gender === 'FEMALE' ? tc('female') : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{tc('role')} — DOB</dt>
                    <dd className="font-medium tabular-nums">
                      {formatDate(record.date_of_birth, locale)}
                    </dd>
                  </div>
                </dl>

                <div className="border-t pt-3">
                  <h3 className="text-sm font-medium mb-2">
                    {record.kh_family_name} {record.kh_given_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {record.en_family_name} {record.en_given_name}
                  </p>
                  {record.phone && (
                    <p className="text-sm tabular-nums mt-1 text-muted-foreground">
                      {record.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

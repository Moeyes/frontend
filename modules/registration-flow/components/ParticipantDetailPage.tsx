'use client';
import { useTranslations } from 'next-intl';
import { QueryBoundary, PageHeader, BackLink, Card, CardContent, Badge } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { useRegistration } from '../hooks/useRegistration';

interface ParticipantDetailPageProps {
  enrollId: number;
}

function DocStatus({ url }: { url?: string | null }) {
  return url
    ? <Badge variant="default">✓</Badge>
    : <Badge variant="outline">—</Badge>;
}

export function ParticipantDetailPage({ enrollId }: ParticipantDetailPageProps) {
  const t  = useTranslations('registration');
  const tc = useTranslations('common');
  const { locale } = useLanguage();

  const query = useRegistration(enrollId, 'athlete');

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.register.home} label={t('backToList')} />
      <PageHeader title={t('createTitle')} />

      <QueryBoundary query={query}>
        {(record) => (
          <div className="space-y-4 max-w-xl">
            <Card>
              <CardContent className="pt-5 space-y-3">
                {/* Names */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{t('review.khmerName')}</dt>
                    <dd className="font-medium">
                      {record.kh_family_name} {record.kh_given_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('review.englishName')}</dt>
                    <dd className="font-medium">
                      {record.en_family_name} {record.en_given_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('review.gender')}</dt>
                    <dd className="font-medium">
                      {record.gender === 'MALE' ? tc('male') : record.gender === 'FEMALE' ? tc('female') : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('fields.dateOfBirth')}</dt>
                    <dd className="font-medium tabular-nums">
                      {formatDate(record.date_of_birth, locale)}
                    </dd>
                  </div>
                  {record.phone && (
                    <div>
                      <dt className="text-muted-foreground">{t('review.phone')}</dt>
                      <dd className="font-medium tabular-nums">{record.phone}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">{t('review.role')}</dt>
                    <dd className="font-medium">
                      {record.role === 'athlete' ? t('roles.athlete') : t('roles.leader')}
                    </dd>
                  </div>
                  {record.sport_id && (
                    <div>
                      <dt className="text-muted-foreground">{t('fields.sport')}</dt>
                      <dd className="font-medium tabular-nums">#{record.sport_id}</dd>
                    </div>
                  )}
                </dl>

                {/* Documents */}
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {t('fields.idDocument')}
                  </p>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">{t('fields.profilePhoto')}</dt>
                      <dd><DocStatus url={record.photoUrl} /></dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">{t('fields.birthCertificate')}</dt>
                      <dd><DocStatus url={record.birthCertificateUrl} /></dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">{t('fields.idDocument')}</dt>
                      <dd><DocStatus url={record.nationalIdUrl} /></dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Passport</dt>
                      <dd><DocStatus url={record.passportUrl} /></dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

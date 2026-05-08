'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { QueryBoundary, PageHeader, BackLink, Card, CardContent } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { useSubmission } from '../hooks/useSubmission';
import { ReviewActions } from './ReviewActions';

interface SubmissionDetailProps {
  submissionId: number;
}

export function SubmissionDetail({ submissionId }: SubmissionDetailProps) {
  const t          = useTranslations('submissions');
  const { locale } = useLanguage();

  const query = useSubmission(submissionId);

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.submissions.list} label={t('backToList')} />
      <PageHeader title={t('detailTitle')} />

      <QueryBoundary query={query}>
        {(entry) => (
          <div className="space-y-4 max-w-xl">
            <Card>
              <CardContent className="pt-5 space-y-3">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{t('org')}</dt>
                    <dd className="font-medium">{entry.org_name ?? `#${entry.org_id}`}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('event')}</dt>
                    <dd className="font-medium">{entry.event_name ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('submittedAt')}</dt>
                    <dd className="font-medium tabular-nums">{formatDate(entry.created_at, locale)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('sportId')}</dt>
                    <dd className="font-medium">#{entry.sports_Events_id ?? '—'}</dd>
                  </div>
                </dl>

                <div className="border-t pt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    { key: 'athleteMale',   val: entry.athlete_male_count   ?? 0 },
                    { key: 'athleteFemale', val: entry.athlete_female_count ?? 0 },
                    { key: 'leaderMale',    val: entry.leader_male_count    ?? 0 },
                    { key: 'leaderFemale',  val: entry.leader_female_count  ?? 0 },
                  ].map(({ key, val }) => (
                    <div key={key}>
                      <dt className="text-muted-foreground">
                        {t(key as Parameters<typeof t>[0])}
                      </dt>
                      <dd className="font-semibold text-lg tabular-nums">{val}</dd>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <ReviewActions />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

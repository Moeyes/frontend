'use client';
import { useTranslations } from 'next-intl';
import { QueryBoundary, PageHeader, BackLink, Card, CardContent } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { useSport } from '../hooks/useSport';
import { SportCategoryManager } from './SportCategoryManager';

interface SportDetailPageProps {
  sportId: number;
}

export function SportDetailPage({ sportId }: SportDetailPageProps) {
  const t          = useTranslations('sports');
  const { locale } = useLanguage();
  const query      = useSport(sportId);

  return (
    <div className="space-y-6">
      <BackLink href={ROUTES.sports.list} label={t('backToSports')} />
      <PageHeader title={t('sportName')} />

      <QueryBoundary query={query}>
        {(sport) => (
          <>
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{sport.name_kh}</h2>
                  {sport.sport_type && (
                    <p className="text-sm text-muted-foreground mt-1">{sport.sport_type}</p>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{t('sportType')}</dt>
                    <dd className="font-medium">{sport.sport_type ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('columns.createdAt')}</dt>
                    <dd className="font-medium">{formatDate(sport.created_at, locale)}</dd>
                  </div>
                </dl>
                <p className="text-xs text-muted-foreground italic">{t('editNotSupported')}</p>
              </CardContent>
            </Card>

            <SportCategoryManager sportId={sportId} />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}

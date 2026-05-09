'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ClipboardList } from 'lucide-react';
import { PageHeader, QueryBoundary, PageEmptyState, Card, CardContent } from '@/shared/ui';
import { useAuth } from '@/core/auth';
import { useEvents } from '@/modules/events';
import { ROUTES } from '@/core/config';

export function SurveyHomePage() {
  const t   = useTranslations('survey');
  const tc  = useTranslations('common');
  const { user } = useAuth();
  // Gap #11: pass organization_id for federation scoping; status=PUBLISHED for federation view
  const eventsQuery = useEvents({
    limit:           100,
    organization_id: user?.organization_id ?? undefined,
    status:          user?.role === 'admin' ? undefined : 'PUBLISHED',
  });

  const surveyTypes = [
    { key: 'bySport',    label: t('bySport'),    desc: t('bySportDesc'),    route: (id: number) => ROUTES.surveys.bySport(id) },
    { key: 'byNumber',   label: t('byNumber'),   desc: t('byNumberDesc'),   route: (id: number) => ROUTES.surveys.byNumber(id) },
    { key: 'byCategory', label: t('byCategory'), desc: t('byCategoryDesc'), route: (id: number) => ROUTES.surveys.byCategory(id) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={t('title')} description={t('description')} />

      <QueryBoundary
        query={eventsQuery}
        empty={<PageEmptyState message={t('noEvents')} />}
      >
        {(eventsData) => (
          <div className="space-y-6">
            {eventsData.data.map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-4 space-y-3">
                  <h2 className="font-semibold text-base">{event.name_kh}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {surveyTypes.map(({ key, label, desc, route }) => (
                      <Link
                        key={key}
                        href={route(event.id)}
                        className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <ClipboardList className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

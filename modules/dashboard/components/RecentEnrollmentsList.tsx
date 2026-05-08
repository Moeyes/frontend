'use client';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, PageEmptyState } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import type { RecentEnrollment } from '../services/dashboard.service';

interface RecentEnrollmentsListProps {
  enrollments: RecentEnrollment[];
}

export function RecentEnrollmentsList({ enrollments }: RecentEnrollmentsListProps) {
  const t  = useTranslations('dashboard');
  const { locale } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('recentEnrollments')}</CardTitle>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <PageEmptyState message={t('noRecentEnrollments')} />
        ) : (
          <ul className="divide-y">
            {enrollments.map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.kh_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{e.sport_name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(e.createdAt, locale)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

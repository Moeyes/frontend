'use client';
import { useTranslations } from 'next-intl';
import { QueryBoundary, PageEmptyState } from '@/shared/ui';
import type { ReportParams } from '../services/reports.service';
import { useRosterReport } from '../hooks/useRosterReport';

interface RosterReportPreviewProps {
  params: ReportParams | null;
}

export function RosterReportPreview({ params }: RosterReportPreviewProps) {
  const t   = useTranslations('reports');
  const query = useRosterReport(params);

  if (!params) return null;

  return (
    <QueryBoundary query={query} empty={<PageEmptyState message={t('noData')} />}>
      {(data) => (
        <div className="overflow-x-auto rounded-md border text-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2 text-left font-medium">{t('org')}</th>
                <th className="px-3 py-2 text-left font-medium">{t('event')}</th>
                <th className="px-3 py-2 text-left font-medium">{t('category')}</th>
                <th className="px-3 py-2 text-left font-medium">{t('gender')}</th>
              </tr>
            </thead>
            <tbody>
              {data.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                data.data.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">{data.org_name}</td>
                    <td className="px-3 py-2">{data.event_name}</td>
                    <td className="px-3 py-2">{row.category}</td>
                    <td className="px-3 py-2">{row.gender ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </QueryBoundary>
  );
}

'use client';
import { useTranslations } from 'next-intl';
import { QueryBoundary, PageEmptyState } from '@/shared/ui';
import type { ReportParams } from '../services/reports.service';
import { useNumbersReport } from '../hooks/useNumbersReport';

interface NumbersReportPreviewProps {
  params: ReportParams | null;
}

export function NumbersReportPreview({ params }: NumbersReportPreviewProps) {
  const t     = useTranslations('reports');
  const query = useNumbersReport(params);

  if (!params) return null;

  return (
    <QueryBoundary query={query} empty={<PageEmptyState message={t('noData')} />}>
      {(data) => {
        const totals = data.data.reduce(
          (acc, r) => ({ male: acc.male + r.male, female: acc.female + r.female, leader: acc.leader + r.leader }),
          { male: 0, female: 0, leader: 0 }
        );

        return (
          <div className="overflow-x-auto rounded-md border text-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-3 py-2 text-left font-medium">{t('rptNumberList.colSport')}</th>
                  <th className="px-3 py-2 text-center font-medium">{t('rptNumberList.colMale')}</th>
                  <th className="px-3 py-2 text-center font-medium">{t('rptNumberList.colFemale')}</th>
                  <th className="px-3 py-2 text-center font-medium">{t('rptNumberList.colLeader')}</th>
                  <th className="px-3 py-2 text-center font-medium">{t('rptNumberList.colTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((row) => (
                  <tr key={row.sport_id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{row.sport_name}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{row.male}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{row.female}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{row.leader}</td>
                    <td className="px-3 py-2 text-center tabular-nums font-semibold">
                      {row.male + row.female + row.leader}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-muted/50 font-semibold">
                  <td className="px-3 py-2">{t('total')}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{totals.male}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{totals.female}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{totals.leader}</td>
                  <td className="px-3 py-2 text-center tabular-nums">
                    {totals.male + totals.female + totals.leader}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      }}
    </QueryBoundary>
  );
}

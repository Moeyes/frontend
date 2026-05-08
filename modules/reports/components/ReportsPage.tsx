'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/shared/ui';
import { ReportFilterBar, type ReportFilters } from './ReportFilterBar';
import { ReportCard }           from './ReportCard';
import { RosterReportPreview }  from './RosterReportPreview';
import { NumbersReportPreview } from './NumbersReportPreview';

export function ReportsPage() {
  const t = useTranslations('reports');

  const [filters, setFilters] = useState<ReportFilters>({
    org_id:    null,
    events_id: null,
  });

  const params =
    filters.org_id && filters.events_id
      ? { org_id: filters.org_id, events_id: filters.events_id }
      : null;

  const REPORTS = [
    {
      // RPT-ROSTER-ALL — EXISTS
      titleKey:    'rptRosterAll.title',
      descKey:     'rptRosterAll.description',
      available:   true,
      downloadPath: '/api/excel/org-sport',
      filenameKey: 'rptRosterAll.filename',
      preview:     <RosterReportPreview params={params} />,
    },
    {
      // RPT-NUMBER-LIST — EXISTS
      titleKey:    'rptNumberList.title',
      descKey:     'rptNumberList.description',
      available:   true,
      downloadPath: '/api/excel/org-sport-participant',
      filenameKey: 'rptNumberList.filename',
      preview:     <NumbersReportPreview params={params} />,
    },
    {
      // RPT-DELEGATION — BACKEND GAP
      titleKey:    'rptDelegation.title',
      descKey:     'rptDelegation.description',
      available:   false,
    },
    {
      // RPT-SPORT-LIST — BACKEND GAP
      titleKey:    'rptSportList.title',
      descKey:     'rptSportList.description',
      available:   false,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      <div className="space-y-2">
        <p className="text-sm font-medium">{t('filters')}</p>
        <ReportFilterBar filters={filters} onChange={setFilters} />
        {!params && (
          <p className="text-xs text-muted-foreground">{t('selectBoth')}</p>
        )}
      </div>

      <div className="space-y-3">
        {REPORTS.map((report) => (
          <ReportCard
            key={report.titleKey}
            params={params}
            {...report}
          />
        ))}
      </div>
    </div>
  );
}

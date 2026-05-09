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
      titleKey:     'rptRosterAll.title',
      descKey:      'rptRosterAll.description',
      available:    true,
      downloadPath: '/api/excel/org-sport/download',
      filenameKey:  'rptRosterAll.filename',
      preview:      <RosterReportPreview params={params} />,
    },
    {
      titleKey:     'rptNumberList.title',
      descKey:      'rptNumberList.description',
      available:    true,
      downloadPath: '/api/excel/org-sport-participant/download',
      filenameKey:  'rptNumberList.filename',
      preview:      <NumbersReportPreview params={params} />,
    },
    {
      titleKey:     'rptDelegation.title',
      descKey:      'rptDelegation.description',
      available:    true,
      downloadPath: '/api/excel/delegation',
      filenameKey:  'rptDelegation.filename',
    },
    {
      titleKey:     'rptSportList.title',
      descKey:      'rptSportList.description',
      available:    true,
      downloadPath: '/api/excel/sport-list',
      filenameKey:  'rptSportList.filename',
      requiresOrgId: false,
    },
    {
      titleKey:     'rptAlbum.title',
      descKey:      'rptAlbum.description',
      available:    true,
      downloadPath: '/api/excel/album',
      filenameKey:  'rptAlbum.filename',
    },
    {
      titleKey:     'rptLeaderAll.title',
      descKey:      'rptLeaderAll.description',
      available:    true,
      downloadPath: '/api/excel/leader-all',
      filenameKey:  'rptLeaderAll.filename',
      requiresOrgId: false,
    },
    {
      titleKey:     'rptCoachAthlete.title',
      descKey:      'rptCoachAthlete.description',
      available:    true,
      downloadPath: '/api/excel/coach-athlete',
      filenameKey:  'rptCoachAthlete.filename',
    },
    {
      titleKey:     'rptDelegationLeaders.title',
      descKey:      'rptDelegationLeaders.description',
      available:    true,
      downloadPath: '/api/excel/delegation-leaders',
      filenameKey:  'rptDelegationLeaders.filename',
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

'use client';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable, QueryBoundary, PageEmptyState, SectionHeader } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { useSurveyEntries } from '../hooks/useSurveyEntries';
import type { SurveyEntry } from '../services/survey.service';

interface SurveyAdminTabProps {
  eventId: number;
}

export function SurveyAdminTab({ eventId }: SurveyAdminTabProps) {
  const t = useTranslations('survey');
  const { locale } = useLanguage();

  // Gap #7 closed: server-side events_id filter now available.
  const query = useSurveyEntries({ events_id: eventId });

  const columns = useMemo<ColumnDef<SurveyEntry>[]>(() => [
    {
      accessorKey: 'org_name',
      header: t('columns.org'),
      cell: ({ getValue }) => <span className="font-medium">{String(getValue() ?? '—')}</span>,
    },
    {
      accessorKey: 'athlete_male_count',
      header: t('columns.athleteM'),
      cell: ({ getValue }) => <span className="tabular-nums">{String(getValue() ?? 0)}</span>,
    },
    {
      accessorKey: 'athlete_female_count',
      header: t('columns.athleteF'),
      cell: ({ getValue }) => <span className="tabular-nums">{String(getValue() ?? 0)}</span>,
    },
    {
      accessorKey: 'leader_male_count',
      header: t('columns.leaderM'),
      cell: ({ getValue }) => <span className="tabular-nums">{String(getValue() ?? 0)}</span>,
    },
    {
      accessorKey: 'leader_female_count',
      header: t('columns.leaderF'),
      cell: ({ getValue }) => <span className="tabular-nums">{String(getValue() ?? 0)}</span>,
    },
    {
      accessorKey: 'created_at',
      header: t('columns.submitted'),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDate(String(getValue()), locale)}
        </span>
      ),
    },
  ], [t, locale]);

  return (
    <section className="space-y-3">
      <SectionHeader title={t('adminTitle')} />
      <QueryBoundary
        query={query}
        empty={<PageEmptyState message={t('adminNoEntries')} />}
      >
        {(data) => (
          <DataTable columns={columns} data={data.data} />
        )}
      </QueryBoundary>
    </section>
  );
}

'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import {
  DataTable, QueryBoundary, PageHeader, PageEmptyState, Button,
} from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { useSubmissions } from '../hooks/useSubmissions';
import { StatusBadge } from './ReviewActions';
import type { SubmissionEntry } from '../services/submissions.service';

export function SubmissionList() {
  const t  = useTranslations('submissions');
  const tc = useTranslations('common');
  const { locale } = useLanguage();
  const router     = useRouter();

  const query = useSubmissions();

  const columns = useMemo<ColumnDef<SubmissionEntry>[]>(() => [
    {
      accessorKey: 'org_name',
      header: t('columns.org'),
      cell: ({ row, getValue }) => (
        <span className="font-medium">
          {String(getValue() ?? `#${row.original.org_id}`)}
        </span>
      ),
    },
    {
      accessorKey: 'event_name',
      header: t('columns.event'),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue() ?? '—')}</span>
      ),
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
      accessorKey: 'status',
      header: t('columns.status'),
      cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'PENDING')} />,
    },
    {
      accessorKey: 'created_at',
      header: t('columns.submittedAt'),
      cell: ({ getValue }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatDate(String(getValue()), locale)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.submissions.detail(row.original.id))}
          aria-label={tc('view')}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ], [t, tc, locale, router]);

  return (
    <div className="space-y-4">
      <PageHeader title={t('title')} description={t('description')} />

      <QueryBoundary
        query={query}
        empty={<PageEmptyState message={t('noSubmissions')} />}
      >
        {(data) => (
          <DataTable columns={columns} data={data.data} />
        )}
      </QueryBoundary>
    </div>
  );
}

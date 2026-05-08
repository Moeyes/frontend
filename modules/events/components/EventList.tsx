'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { DataTable, QueryBoundary, PageHeader, PageEmptyState, Button, Modal } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { useEvents } from '../hooks/useEvents';
import { useDeleteEvent } from '../hooks/useDeleteEvent';
import { EventStatusBadge } from './EventStatusBadge';
import type { EventPublic } from '../services/events.service';

const PAGE_SIZE = 20;

export function EventList() {
  const t  = useTranslations('events');
  const tc = useTranslations('common');
  const { locale } = useLanguage();
  const router     = useRouter();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const query = useEvents({ skip: pagination.pageIndex * PAGE_SIZE, limit: PAGE_SIZE });
  const deleteMutation = useDeleteEvent();

  const pageCount = query.data ? Math.ceil(query.data.count / PAGE_SIZE) : 0;

  const columns = useMemo<ColumnDef<EventPublic>[]>(() => [
    {
      accessorKey: 'name_kh',
      header: t('columns.eventName'),
      cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
    },
    {
      accessorKey: 'type',
      header: t('columns.type'),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      id: 'dates',
      header: t('columns.dates'),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {formatDate(row.original.start_date, locale)} — {formatDate(row.original.end_date, locale)}
        </span>
      ),
    },
    {
      accessorKey: 'location',
      header: t('columns.location'),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue() ?? t('notSet'))}</span>
      ),
    },
    {
      id: 'status',
      header: tc('actions'),
      cell: ({ row }) => <EventStatusBadge event={row.original} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            onClick={() => router.push(ROUTES.events.detail(row.original.id))}
            aria-label={tc('view')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
            aria-label={tc('delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [t, tc, locale, router]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <Button onClick={() => router.push(ROUTES.events.new)}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('createEvent')}
          </Button>
        }
      />

      <QueryBoundary
        query={query}
        empty={<PageEmptyState message={tc('noData')} ctaLabel={t('createEvent')} ctaHref={ROUTES.events.new} />}
      >
        {(data) => (
          <DataTable
            columns={columns}
            data={data.data}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        )}
      </QueryBoundary>

      <Modal
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title={tc('confirm')}
        description={t('deleteConfirm')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>{tc('cancel')}</Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() =>
                deleteId && deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) })
              }
            >
              {tc('delete')}
            </Button>
          </div>
        }
      >
        <span />
      </Modal>
    </div>
  );
}

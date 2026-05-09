'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DataTable, QueryBoundary, PageHeader, PageEmptyState, Button, Modal,
} from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { useSports } from '../hooks/useSports';
import { useDeleteSport } from '../hooks/useDeleteSport';
import type { SportPublic } from '../services/sports.service';

const PAGE_SIZE = 20;

export function SportList() {
  const t  = useTranslations('sports');
  const tc = useTranslations('common');
  const { locale } = useLanguage();
  const router     = useRouter();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const query     = useSports({ skip: pagination.pageIndex * PAGE_SIZE, limit: PAGE_SIZE });
  const deleteMut = useDeleteSport();
  const pageCount = query.data ? Math.ceil(query.data.count / PAGE_SIZE) : 0;

  const columns = useMemo<ColumnDef<SportPublic>[]>(() => [
    {
      accessorKey: 'name_kh',
      header: t('columns.sportName'),
      cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
    },
    {
      accessorKey: 'sport_type',
      header: t('columns.type'),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue() ?? '—')}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: t('columns.createdAt'),
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            onClick={() => router.push(ROUTES.sports.detail(row.original.id))}
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
          <Button onClick={() => router.push(ROUTES.sports.new)}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('createSport')}
          </Button>
        }
      />
      <QueryBoundary
        query={query}
        empty={<PageEmptyState message={tc('noData')} ctaLabel={t('createSport')} ctaHref={ROUTES.sports.new} />}
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
              loading={deleteMut.isPending}
              onClick={() =>
                deleteId && deleteMut.mutate(deleteId, {
                  onSuccess: () => {
                    toast.success(t('deleteSuccess'));
                    setDeleteId(null);
                  },
                  onError: () => toast.error(tc('somethingWentWrong')),
                })
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

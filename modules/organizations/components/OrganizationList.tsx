'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  DataTable, QueryBoundary, PageHeader, PageEmptyState,
  Badge, Button, Modal,
} from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES, DEFAULT_PAGE_SIZE } from '@/core/config';
import { useOrganizations }      from '../hooks/useOrganizations';
import { useDeleteOrganization } from '../hooks/useDeleteOrganization';
import type { OrganizationPublic, InstituteType } from '../services/organizations.service';

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

const TYPE_VARIANT: Record<InstituteType, 'default' | 'secondary'> = {
  province: 'secondary',
  ministry: 'default',
};

export function OrganizationList() {
  const t  = useTranslations('organizations');
  const tc = useTranslations('common');
  const { locale } = useLanguage();
  const router     = useRouter();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const query = useOrganizations({ skip: pagination.pageIndex * PAGE_SIZE, limit: PAGE_SIZE });
  const deleteMutation = useDeleteOrganization();
  const pageCount = query.data ? Math.ceil(query.data.count / PAGE_SIZE) : 0;

  const columns = useMemo<ColumnDef<OrganizationPublic>[]>(() => [
    {
      accessorKey: 'name_kh',
      header: t('columns.orgName'),
      cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
    },
    {
      accessorKey: 'type',
      header: t('columns.type'),
      cell: ({ getValue }) => {
        const v = getValue() as InstituteType;
        return (
          <Badge variant={TYPE_VARIANT[v] ?? 'outline'}>
            {t(`types.${v}` as Parameters<typeof t>[0])}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'code',
      header: t('columns.code'),
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
            onClick={() => router.push(ROUTES.organizations.detail(row.original.id))}
            aria-label={tc('edit')}
          >
            <Pencil className="h-4 w-4" />
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
          <Button onClick={() => router.push(ROUTES.organizations.new)}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('createOrganization')}
          </Button>
        }
      />

      <QueryBoundary
        query={query}
        empty={
          <PageEmptyState
            message={tc('noData')}
            ctaLabel={t('createOrganization')}
            ctaHref={ROUTES.organizations.new}
          />
        }
      >
        {(data) => (
          <DataTable
            columns={columns}
            data={data.data}
            pageCount={pageCount}
            totalCount={data.count}
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

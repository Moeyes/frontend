'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';
import {
  DataTable, QueryBoundary, PageHeader, PageEmptyState, Button, Modal, Input,
} from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { useEffectiveOrgId } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useOrganizers }      from '../hooks/useOrganizers';
import { useDeleteOrganizer } from '../hooks/useDeleteOrganizer';
import { LeaderRoleBadge }    from './LeaderRoleBadge';
import type { OrganizerRecord } from '../services/participation.service';

export function OrganizerList() {
  const t  = useTranslations('participation');
  const tc = useTranslations('common');
  const { locale } = useLanguage();
  const router  = useRouter();
  const orgId   = useEffectiveOrgId();

  const [search, setSearch]    = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const query = useOrganizers({
    organization_id: orgId,
    search: search || null,
  });
  const deleteMutation = useDeleteOrganizer();

  const columns = useMemo<ColumnDef<OrganizerRecord>[]>(() => [
    {
      id: 'name',
      header: t('columns.organizer'),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.kh_family_name} {row.original.kh_given_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.en_family_name} {row.original.en_given_name}</p>
        </div>
      ),
    },
    {
      id: 'leaderRole',
      header: t('columns.leaderRole'),
      cell: ({ row }) => <LeaderRoleBadge role={row.original.leader_role} />,
    },
    {
      accessorKey: 'date_of_birth',
      header: tc('role'),
      cell: ({ getValue }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatDate(String(getValue() ?? ''), locale)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost" size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteId(row.original.id)}
          aria-label={tc('delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ], [t, tc, locale]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <Button onClick={() => router.push(ROUTES.participation.new)}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('addOrganizer')}
          </Button>
        }
      />

      <Input
        placeholder={`${tc('search')}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <QueryBoundary
        query={query}
        empty={
          <PageEmptyState
            message={t('noOrganizers')}
            ctaLabel={t('addOrganizer')}
            ctaHref={ROUTES.participation.new}
          />
        }
      >
        {(data) => <DataTable columns={columns} data={data} />}
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

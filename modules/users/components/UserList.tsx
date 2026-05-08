'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  DataTable, QueryBoundary, PageHeader, PageEmptyState,
  Badge, Button, Modal, Input,
} from '@/shared/ui';
import { ROUTES } from '@/core/config';
import { useUsers } from '../hooks/useUsers';
import { useDeleteUser } from '../hooks/useDeleteUser';
import type { UserPublic } from '../services/users.service';

const PAGE_SIZE = 20;

function RoleBadge({ role }: { role: string }) {
  const t = useTranslations('users.roles');
  const variantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    admin:  'default',
    user1:  'secondary',
    user2:  'outline',
    guest:  'destructive',
  };
  const variant = variantMap[role] ?? 'outline';
  const label = (['admin', 'user1', 'user2', 'guest'] as const).includes(role as 'admin')
    ? t(role as Parameters<typeof t>[0])
    : role;
  return <Badge variant={variant}>{label}</Badge>;
}

export function UserList() {
  const t  = useTranslations('users');
  const tc = useTranslations('common');
  const router = useRouter();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = {
    skip:  pagination.pageIndex * PAGE_SIZE,
    limit: PAGE_SIZE,
    username: search || undefined,
  };
  const query = useUsers(params);
  const deleteMutation = useDeleteUser();

  const pageCount = query.data
    ? Math.ceil(query.data.count / PAGE_SIZE)
    : 0;

  const columns = useMemo<ColumnDef<UserPublic>[]>(() => [
    {
      accessorKey: 'kh_family_name',
      header: t('columns.user'),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.kh_family_name} {row.original.kh_given_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.en_family_name} {row.original.en_given_name}</p>
        </div>
      ),
    },
    {
      accessorKey: 'username',
      header: t('username'),
    },
    {
      accessorKey: 'email',
      header: t('columns.email'),
    },
    {
      accessorKey: 'role',
      header: t('columns.role'),
      cell: ({ getValue }) => <RoleBadge role={String(getValue())} />,
    },
    {
      accessorKey: 'is_active',
      header: t('columns.status'),
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? 'secondary' : 'outline'}>
          {getValue() ? tc('yes') : tc('no')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: tc('actions'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.users.detail(row.original.id))}
            aria-label={tc('edit')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
            aria-label={tc('delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [t, tc, router]);

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <Button onClick={() => router.push(ROUTES.users.new)}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('createUser')}
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder={`${tc('search')}...`}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
          className="max-w-xs"
        />
      </div>

      <QueryBoundary
        query={query}
        empty={<PageEmptyState message={tc('noData')} ctaLabel={t('createUser')} ctaHref={ROUTES.users.new} />}
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
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title={tc('confirm')}
        description={t('deleteConfirm')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {tc('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
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

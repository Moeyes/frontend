'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Trash2, Users } from 'lucide-react';
import {
  DataTable, QueryBoundary, PageHeader, PageEmptyState, Button, Modal, Input, Badge,
} from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { useEffectiveOrgId } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useRegistrations } from '../hooks/useRegistrations';
import { useDeleteRegistration } from '../hooks/useDeleteRegistration';
import type { ParticipantRecord } from '../services/registration.service';

export function RegistrationHomePage() {
  const t  = useTranslations('registration');
  const tc = useTranslations('common');
  const { locale } = useLanguage();
  const router     = useRouter();


  const orgId = useEffectiveOrgId();
  const [search, setSearch]   = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const query = useRegistrations({
    role:            'athlete',
    organization_id: orgId ?? undefined,
    search:          search || undefined,
    limit:           100,
  });
  const deleteMutation = useDeleteRegistration();

  const columns = useMemo<ColumnDef<ParticipantRecord>[]>(() => [
    {
      id: 'name',
      header: t('list.columns.participant'),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.kh_family_name} {row.original.kh_given_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.en_family_name} {row.original.en_given_name}</p>
        </div>
      ),
    },
    {
      id: 'role',
      header: t('list.columns.role'),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.role === 'athlete' ? t('roles.athlete') : t('roles.leader')}
        </Badge>
      ),
    },
    {
      accessorKey: 'date_of_birth',
      header: t('fields.dateOfBirth'),
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            onClick={() => router.push(ROUTES.register.detail(row.original.id))}
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
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(ROUTES.register.team)} className="gap-2">
              <Users className="h-4 w-4" aria-hidden="true" />
              {t('teamMode.title')}
            </Button>
            <Button onClick={() => router.push(ROUTES.register.new)}>
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('addParticipant')}
            </Button>
          </div>
        }
      />

      <Input
        placeholder={t('list.searchPlaceholder')}
        aria-label={tc('search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <QueryBoundary
        query={query}
        empty={<PageEmptyState message={t('list.noParticipants')} ctaLabel={t('addParticipant')} ctaHref={ROUTES.register.new} />}
      >
        {(data) => (
          <DataTable columns={columns} data={data} />
        )}
      </QueryBoundary>

      <Modal
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title={tc('confirm')}
        description={t('list.deleteConfirm')}
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

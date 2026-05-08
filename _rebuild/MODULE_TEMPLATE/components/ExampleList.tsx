'use client';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/shared/ui/DataTable';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { PageEmptyState } from '@/shared/ui/page/PageEmptyState';
import { useDOMAINList } from '../hooks';
import type { ColumnDef } from '@tanstack/react-table';
import type { DOMAINPublic } from '../services/example.service';

function useDOMAINColumns(): ColumnDef<DOMAINPublic>[] {
  const t = useTranslations();
  return [
    // { accessorKey: 'id', header: t('DOMAIN.columns.id') },
    // { accessorKey: 'name_kh', header: t('DOMAIN.columns.name') },
  ];
}

export function DOMAINList() {
  const query = useDOMAINList();
  const columns = useDOMAINColumns();

  return (
    <QueryBoundary
      query={query}
      empty={
        <PageEmptyState
          messageKey="DOMAIN.empty"
          ctaKey="DOMAIN.create"
          // ctaHref="/DOMAIN/new"
        />
      }
    >
      {(data) => (
        <DataTable
          columns={columns}
          data={(data as any)?.data ?? []}
        />
      )}
    </QueryBoundary>
  );
}

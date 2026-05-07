'use client'

import { useTranslations } from 'next-intl'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { DataTable } from '@/shared/ui/DataTable'
import { useExampleList } from '../hooks'
import { columns } from './columns'

export function ExampleList() {
  const t = useTranslations('MODULE_NAME')
  const { data, isLoading, isError, refetch } = useExampleList()

  return (
    <QueryBoundary
      isLoading={isLoading}
      isEmpty={!data?.data.length}
      isError={isError}
      onRetry={refetch}
      emptyMessage={t('list.empty')}
    >
      <DataTable columns={columns} data={data?.data ?? []} />
    </QueryBoundary>
  )
}

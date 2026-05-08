'use client';
import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Skeleton } from './Skeleton';
import { Button } from './Button';

interface QueryBoundaryProps<TData> {
  query: UseQueryResult<TData>;
  empty?: ReactNode;
  loadingFallback?: ReactNode;
  children: (data: NonNullable<TData>) => ReactNode;
}

function DefaultSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function QueryBoundary<TData>({
  query,
  empty,
  loadingFallback,
  children,
}: QueryBoundaryProps<TData>) {
  const t = useTranslations('common');

  if (query.isLoading || query.isPending) {
    return <>{loadingFallback ?? <DefaultSkeleton />}</>;
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <p className="text-destructive text-sm">
          {(query.error as Error)?.message ?? t('loadError')}
        </p>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (!query.data || (Array.isArray(query.data) && query.data.length === 0)) {
    return <>{empty ?? null}</>;
  }

  return <>{children(query.data as NonNullable<TData>)}</>;
}

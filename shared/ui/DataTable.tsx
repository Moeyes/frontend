'use client';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type OnChangeFn,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  // Server-side pagination
  pageCount?: number;
  totalCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage,
  pageCount,
  totalCount,
  pagination,
  onPaginationChange,
  className,
}: DataTableProps<TData>) {
  const tc = useTranslations('common');
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: !!pageCount,
    pageCount: pageCount ?? -1,
    state: pagination ? { pagination } : undefined,
    onPaginationChange,
  });

  return (
    <div className={cn('space-y-2', className)}>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                  aria-live="polite"
                >
                  {emptyMessage ?? tc('noData')}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount && pagination && onPaginationChange && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {totalCount != null
              ? `${tc('showing')} ${pagination.pageIndex * pagination.pageSize + 1}–${Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} ${tc('of')} ${totalCount}`
              : `${pagination.pageIndex + 1} / ${pageCount}`}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-label={tc('previous')}
              onClick={() =>
                onPaginationChange((p) =>
                  typeof p === 'function' ? p : { ...pagination, pageIndex: pagination.pageIndex - 1 }
                )
              }
              disabled={pagination.pageIndex === 0}
            >
              ‹
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label={tc('next')}
              onClick={() =>
                onPaginationChange((p) =>
                  typeof p === 'function' ? p : { ...pagination, pageIndex: pagination.pageIndex + 1 }
                )
              }
              disabled={pagination.pageIndex >= pageCount - 1}
            >
              ›
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

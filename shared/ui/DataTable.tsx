'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface DataTableProps<T> {
    data: T[];
    columns: {
        header: string;
        accessor: keyof T | ((item: T, index: number) => ReactNode);
        className?: string;
        align?: 'left' | 'center' | 'right';
    }[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    className?: string;
    isLoading?: boolean;
    /**
     * Minimum table width before horizontal scroll kicks in. Defaults to a
     * value that keeps full-page list tables readable on mobile. Pass
     * `min-w-0` for compact tables living inside narrow containers (e.g.
     * dashboard cards) so they fit without forcing scroll.
     */
    minWidth?: string;
    /** Number of placeholder rows to render while loading. Defaults to 5. */
    skeletonRows?: number;
}

export function DataTable<T>({
    data,
    columns,
    onRowClick,
    emptyMessage = 'No data available',
    className,
    isLoading,
    minWidth = 'min-w-[640px]',
    skeletonRows = 5,
}: DataTableProps<T>) {
    return (
        <div className={cn('w-full overflow-x-auto', className)}>
            <table className={cn('w-full text-left border-collapse', minWidth)}>
                <thead>
                    <tr className="border-b border-border bg-muted">
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={cn(
                                    'px-4 py-3 text-sm font-medium leading-relaxed text-muted-foreground',
                                    col.align === 'right' && 'text-right',
                                    col.align === 'center' && 'text-center',
                                    col.className
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {isLoading ? (
                        Array.from({ length: skeletonRows }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                {columns.map((_, j) => (
                                    <td key={j} className="p-4 py-4">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="p-12 text-center text-sm leading-relaxed text-muted-foreground">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, i) => (
                            <tr
                                key={i}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    'transition-colors',
                                    onRowClick ? 'cursor-pointer hover:bg-accent/50' : 'hover:bg-accent/30'
                                )}
                            >
                                {columns.map((col, j) => (
                                    <td
                                        key={j}
                                        className={cn(
                                            'px-4 py-3 text-sm leading-relaxed text-foreground',
                                            col.align === 'right' && 'text-right',
                                            col.align === 'center' && 'text-center',
                                            col.className
                                        )}
                                    >
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(item, i)
                                            : (item[col.accessor] as ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

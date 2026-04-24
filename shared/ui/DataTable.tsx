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
}

export function DataTable<T>({
    data,
    columns,
    onRowClick,
    emptyMessage = 'No data available',
    className,
    isLoading,
}: DataTableProps<T>) {
    return (
        <div className={cn('w-full overflow-hidden', className)}>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border bg-muted/30">
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={cn(
                                    'p-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground',
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
                        Array.from({ length: 3 }).map((_, i) => (
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
                            <td colSpan={columns.length} className="p-12 text-center text-sm font-medium text-muted-foreground italic">
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
                                    onRowClick ? 'cursor-pointer hover:bg-secondary/30' : 'hover:bg-secondary/10'
                                )}
                            >
                                {columns.map((col, j) => (
                                    <td
                                        key={j}
                                        className={cn(
                                            'p-4 py-3 text-sm font-medium text-foreground',
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

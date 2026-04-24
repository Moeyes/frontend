import { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface ContentPanelProps {
    children: ReactNode;
    className?: string;
    dashed?: boolean;
}

export function ContentPanel({ children, className, dashed = false }: ContentPanelProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-card p-6 shadow-sm transition-all',
                dashed && 'border-dashed border-2',
                className
            )}
        >
            {children}
        </div>
    );
}

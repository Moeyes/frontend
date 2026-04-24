import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface PageEmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

export function PageEmptyState({
    title,
    description,
    icon: Icon,
    action,
    className,
}: PageEmptyStateProps) {
    return (
        <div className={cn('rounded-2xl border-2 border-dashed border-border bg-card/50 p-16 text-center shadow-sm', className)}>
            <div className="flex flex-col items-center gap-4">
                {Icon && (
                    <div className="rounded-2xl bg-primary/5 p-4">
                        <Icon className="h-8 w-8 text-primary/40" />
                    </div>
                )}
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{title}</h3>
                    {description && (
                        <p className="mx-auto max-w-sm text-sm font-medium text-muted-foreground">{description}</p>
                    )}
                </div>
                {action && <div className="mt-2">{action}</div>}
            </div>
        </div>
    );
}

import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between', className)}>
            <div className="flex items-center gap-4">
                {Icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-black text-foreground">{title}</h1>
                    {description && <p className="text-sm font-medium text-muted-foreground">{description}</p>}
                </div>
            </div>
            {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
    );
}

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
        <div className={cn('flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between', className)}>
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary shadow-sm">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                )}
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold leading-snug text-foreground">{title}</h1>
                    {description && <p className="mt-1 text-sm leading-[1.8] text-muted-foreground">{description}</p>}
                </div>
            </div>
            {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
    );
}

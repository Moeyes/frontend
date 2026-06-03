import { ReactNode } from 'react';
import { AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface PageErrorStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

/**
 * Standard error panel for failed data loads. Replaces the ad-hoc
 * `border-destructive/5` blocks that were duplicated across list/detail pages.
 */
export function PageErrorState({
    title,
    description,
    icon: Icon = AlertCircle,
    action,
    className,
}: PageErrorStateProps) {
    return (
        <div
            className={cn(
                'rounded-lg border border-destructive/20 bg-destructive/5 p-12 text-center',
                className,
            )}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                    <Icon className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                    <p className="font-semibold leading-snug text-destructive">{title}</p>
                    {description && (
                        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="mt-2">{action}</div>}
            </div>
        </div>
    );
}

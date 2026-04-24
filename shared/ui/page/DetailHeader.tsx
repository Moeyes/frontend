import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BackLink } from './BackLink';

interface DetailHeaderProps {
    backHref: string;
    backLabel: string;
    eyebrow?: string;
    eyebrowIcon?: LucideIcon;
    title: string;
    description?: string;
    meta?: ReactNode;
    action?: ReactNode;
}

export function DetailHeader({
    backHref,
    backLabel,
    eyebrow,
    eyebrowIcon: EyebrowIcon,
    title,
    description,
    meta,
    action,
}: DetailHeaderProps) {
    return (
        <div className="flex flex-col gap-4">
            <BackLink href={backHref} label={backLabel} />

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    {eyebrow && (
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                            {EyebrowIcon && <EyebrowIcon className="h-4 w-4" />}
                            {eyebrow}
                        </div>
                    )}
                    <h1 className="text-2xl font-black text-foreground">{title}</h1>
                    {description && <p className="text-sm font-medium text-muted-foreground">{description}</p>}
                    {meta && <div className="pt-2 flex flex-wrap gap-3">{meta}</div>}
                </div>
                {action && <div className="flex items-center gap-3">{action}</div>}
            </div>
        </div>
    );
}

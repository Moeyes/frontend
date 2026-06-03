import React, { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
    border?: boolean;
}

export function SectionHeader({
    title,
    subtitle,
    icon: Icon,
    action,
    className,
    border = true,
}: SectionHeaderProps) {
    return (
        <div className={cn(
            'flex items-center justify-between p-6 pb-4',
            border && 'border-b border-border',
            className
        )}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                )}
                <div>
                    <h3 className="text-sm font-semibold leading-snug text-foreground">{title}</h3>
                    {subtitle && <p className="text-xs leading-relaxed text-muted-foreground">{subtitle}</p>}
                </div>
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    );
}

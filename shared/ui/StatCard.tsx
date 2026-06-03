'use client';

import React from 'react';
import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color?: 'primary' | 'blue' | 'amber' | 'emerald' | 'purple' | 'error';
    className?: string;
}

const COLOR_MAP = {
    primary: 'text-primary bg-accent',
    blue: 'text-primary bg-accent',
    amber: 'text-warning bg-warning/10',
    emerald: 'text-success bg-success/10',
    purple: 'text-secondary bg-secondary/10',
    error: 'text-destructive bg-destructive/10',
};

const STRIP_MAP = {
    primary: 'bg-primary',
    blue: 'bg-primary',
    amber: 'bg-warning',
    emerald: 'bg-success',
    purple: 'bg-secondary',
    error: 'bg-destructive',
};

export function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    color = 'primary',
    className,
}: StatCardProps) {
    return (
        <div className={cn('relative overflow-hidden rounded-lg border border-border bg-card p-6 pl-7 shadow-sm transition-shadow hover:shadow-md', className)}>
            {/* Accent strip */}
            <span className={cn('absolute inset-y-0 left-0 w-1', STRIP_MAP[color])} aria-hidden />
            <div className="mb-4 flex items-start justify-between">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', COLOR_MAP[color])}>
                    <Icon className="h-5 w-5" />
                </div>
                {trend && (
                    <div className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                        trend.isUp ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    )}>
                        {trend.isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {trend.value}%
                    </div>
                )}
            </div>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{label}</p>
        </div>
    );
}

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
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
    primary: 'text-primary bg-primary/10',
    blue: 'text-blue-600 bg-blue-100',
    amber: 'text-amber-600 bg-amber-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    purple: 'text-purple-600 bg-purple-100',
    error: 'text-error bg-error/10',
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
        <div className={cn('bg-card p-6 rounded-xl border border-border shadow-sm transition-all hover:shadow-md', className)}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn('p-2.5 rounded-xl', COLOR_MAP[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black',
                        trend.isUp ? 'text-emerald-600 bg-emerald-50' : 'text-error bg-error/5'
                    )}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-black text-foreground tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
        </div>
    );
}

import React from 'react';
import { cn } from '@/shared/utils/cn';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    size?: 'xs' | 'sm' | 'md';
    className?: string;
}

const VARIANT_MAP = {
    default: 'bg-primary/10 text-primary border-transparent',
    secondary: 'bg-secondary/80 text-secondary-foreground border-transparent',
    success: 'bg-emerald-100 text-emerald-700 border-transparent',
    warning: 'bg-amber-100 text-amber-700 border-transparent',
    error: 'bg-error/10 text-error border-transparent',
    info: 'bg-blue-100 text-blue-700 border-transparent',
    outline: 'bg-transparent text-foreground border-border',
};

const SIZE_MAP = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
};

export function Badge({
    children,
    variant = 'default',
    size = 'sm',
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-lg border font-black uppercase tracking-wider',
                VARIANT_MAP[variant],
                SIZE_MAP[size],
                className
            )}
        >
            {children}
        </span>
    );
}

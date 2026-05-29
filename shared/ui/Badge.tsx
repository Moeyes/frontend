import React from 'react';
import { cn } from '@/shared/utils/cn';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'flagged' | 'revision_requested' | 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    size?: 'xs' | 'sm' | 'md';
    className?: string;
}

const VARIANT_MAP = {
    draft: 'bg-muted text-muted-foreground border-border',
    submitted: 'bg-accent text-accent-foreground border-border',
    approved: 'bg-success text-white border-transparent',
    rejected: 'bg-destructive text-destructive-foreground border-transparent',
    flagged: 'bg-warning text-warning-foreground border-transparent',
    revision_requested: 'bg-warning text-warning-foreground border-transparent',
    default: 'bg-primary/10 text-primary border-transparent',
    secondary: 'bg-secondary text-secondary-foreground border-transparent',
    success: 'bg-success text-white border-transparent',
    warning: 'bg-warning text-warning-foreground border-transparent',
    error: 'bg-destructive text-destructive-foreground border-transparent',
    info: 'bg-accent text-accent-foreground border-transparent',
    outline: 'bg-transparent text-foreground border border-border',
};

const SIZE_MAP = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
};

const LABEL_MAP: Record<string, string> = {
    draft: 'ព្រាង',
    submitted: 'បានដាក់ស្នើ',
    approved: 'អនុម័ត',
    rejected: 'បដិសេធ',
    flagged: 'សម្គាល់',
    revision_requested: 'ត្រូវកែ',
};

export function Badge({
    children,
    variant = 'default',
    size = 'sm',
    className,
}: BadgeProps) {
    const displayText = LABEL_MAP[variant] || children;
    
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md border font-medium leading-relaxed',
                VARIANT_MAP[variant],
                SIZE_MAP[size],
                className
            )}
        >
            {displayText}
        </span>
    );
}

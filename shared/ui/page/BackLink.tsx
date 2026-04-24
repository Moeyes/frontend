import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface BackLinkProps {
    href: string;
    label: string;
    className?: string;
}

export function BackLink({ href, label, className }: BackLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                'flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-primary hover:translate-x-[-4px]',
                className
            )}
        >
            <ChevronLeft className="h-4 w-4 stroke-[3px]" />
            {label}
        </Link>
    );
}

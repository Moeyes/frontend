import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface PageLoadingStateProps {
    label?: string;
    className?: string;
}

export function PageLoadingState({
    label = 'Loading Content...',
    className,
}: PageLoadingStateProps) {
    return (
        <div className={cn('flex min-h-[400px] flex-col items-center justify-center gap-6 p-12', className)}>
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-pulse text-primary/40" />
            </div>
            <p className="animate-pulse text-sm leading-relaxed text-muted-foreground">{label}</p>
        </div>
    );
}

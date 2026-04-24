import { ReactNode } from 'react';
import { PageShell } from '@/shared/layout/PageShell';

interface PageNotFoundProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function PageNotFound({ title, description, action }: PageNotFoundProps) {
    return (
        <PageShell padded={false} size="wide">
            <div className="py-20 text-center flex flex-col items-center gap-6">
                <div className="h-24 w-24 rounded-3xl bg-primary/5 flex items-center justify-center mb-4">
                    <span className="text-4xl font-black text-primary/20">404</span>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">{title}</h1>
                    {description && <p className="mt-2 text-base font-medium text-muted-foreground max-w-md mx-auto">{description}</p>}
                </div>
                {action && <div className="mt-2">{action}</div>}
            </div>
        </PageShell>
    );
}

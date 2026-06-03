'use client';

import { Button } from '@/shared/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ByNumberSuccessProps {
    onRegisterAnother?: () => void;
}

export function ByNumberSuccess({ onRegisterAnother }: ByNumberSuccessProps) {
    const t = useTranslations('registration.success');
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-9 w-9 text-success" />
                </div>
                <h1 className="mb-2 text-xl font-semibold leading-snug text-foreground">{t('title')}</h1>
                <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{t('subtitle')}</p>

                {onRegisterAnother && (
                    <Button onClick={onRegisterAnother} className="w-full">
                        {t('registerAnother')}
                    </Button>
                )}
            </div>
        </div>
    );
}

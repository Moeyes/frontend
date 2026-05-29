'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/shared/utils/cn';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const toggle = () => {
        const next = locale === 'en' ? 'kh' : 'en';
        document.cookie = `locale=${next}; path=/; max-age=31536000`;
        startTransition(() => router.refresh());
    };

    return (
        <button
            onClick={toggle}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent/40 disabled:opacity-50"
        >
            <span className={cn('rounded-full px-2 py-0.5 transition-colors', locale === 'kh' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                ខ្មែរ
            </span>
            <span className="text-border">|</span>
            <span className={cn('rounded-full px-2 py-0.5 transition-colors', locale === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                EN
            </span>
        </button>
    );
}

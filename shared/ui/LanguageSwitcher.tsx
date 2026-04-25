'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const t = useTranslations('language');
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-[10px] font-black uppercase tracking-widest text-foreground disabled:opacity-50"
        >
            <span>{locale === 'en' ? '🇰🇭' : '🇬🇧'}</span>
            <span>{t('switchTo')}</span>
        </button>
    );
}

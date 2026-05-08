'use client';
import { useLanguage, type Locale } from './LanguageProvider';

const labels: Record<Locale, string> = {
  kh: 'ខ្មែរ',
  en: 'EN',
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-sm">
      {(['kh', 'en'] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={[
            'px-2 py-0.5 rounded transition-colors',
            locale === l
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
          aria-pressed={locale === l}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}

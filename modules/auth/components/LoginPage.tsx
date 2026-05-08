'use client';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/core/i18n';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  const t = useTranslations('auth');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('welcomeBack')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('signInSubtitle')}</p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

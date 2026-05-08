'use client';
import { useTranslations } from 'next-intl';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-destructive">
        {error.message || t('somethingWentWrong')}
      </p>
      <button
        onClick={reset}
        className="text-sm text-primary underline underline-offset-4"
      >
        {t('retry')}
      </button>
    </div>
  );
}

'use client';
import { useTranslations } from 'next-intl';
import { PageErrorState } from '@/shared/ui';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('dashboard');
  return (
    <PageErrorState
      error={new Error(error.message || t('failedToLoad'))}
      onRetry={reset}
    />
  );
}

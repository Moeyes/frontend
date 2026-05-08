'use client';
import { useTranslations } from 'next-intl';
import { Button } from '../Button';

interface PageErrorStateProps {
  error?: Error;
  onRetry?: () => void;
}

export function PageErrorState({ error, onRetry }: PageErrorStateProps) {
  const t = useTranslations('common');

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="text-4xl" aria-hidden="true">⚠️</div>
      <p className="text-destructive font-medium">
        {error?.message ?? t('loadError')}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t('retry')}
        </Button>
      )}
    </div>
  );
}

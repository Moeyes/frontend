'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';

interface ByNumberFormNavButtonsProps {
  stepIndex: number;
  currentStep: string;
  selectedEventType: string | null;
  isPending: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function ByNumberFormNavButtons({
  stepIndex,
  currentStep,
  selectedEventType,
  isPending,
  onPrevious,
  onNext,
}: ByNumberFormNavButtonsProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('bynumber');

  return (
    <div className="mt-8 flex gap-4 border-t border-border pt-6">
      <Button type="button" onClick={onPrevious} variant="outline" disabled={stepIndex === 0}>
        {tCommon('previous')}
      </Button>
      <div className="flex-1" />
      {currentStep !== 'review' ? (
        <Button type="button" onClick={onNext} disabled={currentStep === 'event_type' && !selectedEventType}>
          {tCommon('next')}
        </Button>
      ) : (
        <Button type="submit" loading={isPending}>
          {isPending ? t('submitting') : t('submit')}
        </Button>
      )}
    </div>
  );
}

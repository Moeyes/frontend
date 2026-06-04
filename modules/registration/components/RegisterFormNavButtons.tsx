'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';

interface RegisterFormNavButtonsProps {
  isFirstStep: boolean;
  isReviewStep: boolean;
  isPending: boolean;
  registerWindowError: string | null;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function RegisterFormNavButtons({
  isFirstStep,
  isReviewStep,
  isPending,
  registerWindowError,
  onBack,
  onNext,
  onSubmit,
}: RegisterFormNavButtonsProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('registration');

  return (
    <div className="flex justify-between items-center gap-4">
      <Button onClick={onBack} variant="outline" disabled={isFirstStep} className="flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" />{tCommon('back')}
      </Button>
      {!isReviewStep ? (
        <Button onClick={onNext} disabled={registerWindowError !== null} className="flex items-center gap-2">
          {tCommon('next')} <ChevronRight className="w-4 h-4" />
        </Button>
      ) : (
        <Button onClick={onSubmit} disabled={isPending || registerWindowError !== null} className="flex items-center gap-2 min-w-35">
          {isPending ? tCommon('saving') : t('success.registerAnother')}
        </Button>
      )}
    </div>
  );
}

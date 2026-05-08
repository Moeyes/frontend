'use client';
import { useTranslations } from 'next-intl';
import { AlertTriangle, CheckCircle2, XCircle, Flag } from 'lucide-react';
import { Button } from '@/shared/ui';

export function ReviewActions() {
  const t = useTranslations('submissions');

  return (
    <div className="space-y-3">
      {/* FSM gap banner */}
      <div className="flex items-start gap-3 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">{t('fsmGapTitle')}</p>
          <p className="text-xs mt-0.5 text-yellow-700">{t('fsmGapDetail')}</p>
        </div>
      </div>

      {/* Disabled action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled
          title={t('actionUnavailable')}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
          {t('approve')}
        </Button>
        <Button
          variant="outline"
          disabled
          title={t('actionUnavailable')}
          className="gap-2"
        >
          <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
          {t('reject')}
        </Button>
        <Button
          variant="outline"
          disabled
          title={t('actionUnavailable')}
          className="gap-2"
        >
          <Flag className="h-4 w-4 text-orange-500" aria-hidden="true" />
          {t('flag')}
        </Button>
      </div>
    </div>
  );
}

'use client';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export function OrgIdGapBanner() {
  const t = useTranslations('survey');
  return (
    <div className="flex items-start gap-3 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium">{t('orgIdMissing')}</p>
        <p className="text-xs mt-0.5 text-yellow-700">{t('orgIdMissingDetail')}</p>
      </div>
    </div>
  );
}

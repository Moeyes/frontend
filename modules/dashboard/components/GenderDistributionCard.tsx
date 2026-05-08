'use client';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import type { GenderDistribution } from '../services/dashboard.service';

interface GenderDistributionCardProps {
  distribution: GenderDistribution;
}

export function GenderDistributionCard({ distribution }: GenderDistributionCardProps) {
  const t = useTranslations('dashboard');
  const total = distribution.male + distribution.female + distribution.other;
  const pct = (n: number) =>
    total === 0 ? 0 : Math.round((n / total) * 100);

  const bars: { labelKey: 'male' | 'female' | 'other'; value: number; color: string }[] = [
    { labelKey: 'male',   value: distribution.male,   color: 'bg-blue-500' },
    { labelKey: 'female', value: distribution.female, color: 'bg-pink-500' },
    { labelKey: 'other',  value: distribution.other,  color: 'bg-gray-400' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('genderDistribution')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bars.map(({ labelKey, value, color }) => (
          <div key={labelKey}>
            <div className="flex justify-between text-xs mb-1">
              <span>{t(labelKey)}</span>
              <span className="text-muted-foreground">{value} ({pct(value)}%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all`}
                style={{ width: `${pct(value)}%` }}
                role="progressbar"
                aria-valuenow={pct(value)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

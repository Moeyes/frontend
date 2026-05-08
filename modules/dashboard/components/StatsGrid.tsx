'use client';
import { useTranslations } from 'next-intl';
import { Users, CalendarDays, Building2, Medal } from 'lucide-react';
import { StatCard } from '@/shared/ui';
import type { StatsResponse } from '../services/dashboard.service';

interface StatsGridProps {
  stats: StatsResponse;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const t = useTranslations('dashboard.stats');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t('totalParticipants')}
        value={stats.participants}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title={t('activeEvents')}
        value={stats.events}
        icon={<CalendarDays className="h-4 w-4" />}
      />
      <StatCard
        title={t('organizations')}
        value={stats.organizations}
        icon={<Building2 className="h-4 w-4" />}
      />
      <StatCard
        title={t('totalSports')}
        value={stats.sports}
        icon={<Medal className="h-4 w-4" />}
      />
    </div>
  );
}

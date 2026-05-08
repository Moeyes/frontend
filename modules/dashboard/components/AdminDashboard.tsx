'use client';
import { useTranslations } from 'next-intl';
import { QueryBoundary, Skeleton } from '@/shared/ui';
import { useDashboard } from '../hooks';
import { StatsGrid } from './StatsGrid';
import { RecentEnrollmentsList } from './RecentEnrollmentsList';
import { TopOrgsList } from './TopOrgsList';
import { GenderDistributionCard } from './GenderDistributionCard';

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const t = useTranslations('dashboard');
  const query = useDashboard();

  return (
    <div className="space-y-6">
      <QueryBoundary query={query} loadingFallback={<StatsGridSkeleton />}>
        {(data) => (
          <>
            <StatsGrid stats={data.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <RecentEnrollmentsList enrollments={data.recentEnrollments} />
              </div>
              <div className="space-y-4">
                <TopOrgsList orgs={data.topOrganizations} />
                <GenderDistributionCard distribution={data.genderDistribution} />
              </div>
            </div>
          </>
        )}
      </QueryBoundary>

      {query.isError && (
        <p className="text-xs text-muted-foreground text-center">
          {t('failedToLoad')}
        </p>
      )}
    </div>
  );
}

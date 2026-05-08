'use client';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/shared/ui';
import { useEvents } from '@/modules/events';
import { useOrganizations } from '@/modules/organizations';

export interface ReportFilters {
  org_id:    number | null;
  events_id: number | null;
}

interface ReportFilterBarProps {
  filters:   ReportFilters;
  onChange:  (filters: ReportFilters) => void;
}

export function ReportFilterBar({ filters, onChange }: ReportFilterBarProps) {
  const t = useTranslations('reports');

  const eventsQuery = useEvents({ limit: 100 });
  const orgsQuery   = useOrganizations({ limit: 200 });

  if (eventsQuery.isLoading || orgsQuery.isLoading) {
    return (
      <div className="flex gap-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-56" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        className="rounded-md border px-3 py-2 text-sm bg-background min-w-[200px]"
        value={filters.events_id ?? ''}
        onChange={(e) =>
          onChange({ ...filters, events_id: e.target.value ? Number(e.target.value) : null })
        }
      >
        <option value="">{t('selectEvent')}</option>
        {(eventsQuery.data?.data ?? []).map((ev) => (
          <option key={ev.id} value={ev.id}>{ev.name_kh}</option>
        ))}
      </select>

      <select
        className="rounded-md border px-3 py-2 text-sm bg-background min-w-[200px]"
        value={filters.org_id ?? ''}
        onChange={(e) =>
          onChange({ ...filters, org_id: e.target.value ? Number(e.target.value) : null })
        }
      >
        <option value="">{t('selectOrganization')}</option>
        {(orgsQuery.data?.data ?? []).map((org) => (
          <option key={org.id} value={org.id}>{org.name_kh}</option>
        ))}
      </select>
    </div>
  );
}

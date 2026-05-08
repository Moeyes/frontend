'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader, QueryBoundary, PageEmptyState, Skeleton, OrgSelectorBanner } from '@/shared/ui';
import { useAuth, useEffectiveOrgId } from '@/core/auth';
import { useEvents } from '@/modules/events';
import { useOrganizations } from '@/modules/organizations';
import { useCards } from '../hooks/useCards';
import { ParticipantCard } from './ParticipantCard';

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}

export function CardsPage() {
  const t      = useTranslations('cards');
  const { user } = useAuth();
  const effectiveOrgId = useEffectiveOrgId();
  const isAdmin = user?.role === 'admin';

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedOrgId,   setSelectedOrgId]   = useState<number | null>(effectiveOrgId);

  const eventsQuery = useEvents({ limit: 100 });
  const orgsQuery   = useOrganizations({ limit: 200 });

  const cardsQuery = useCards(selectedOrgId, selectedEventId);

  const canLoad = !!selectedOrgId && !!selectedEventId;

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      {!isAdmin && !effectiveOrgId && <OrgSelectorBanner onOrgSelected={setSelectedOrgId} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="rounded-md border px-3 py-2 text-sm bg-background min-w-[200px]"
          value={selectedEventId ?? ''}
          onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">{t('selectEvent')}</option>
          {(eventsQuery.data?.data ?? []).map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name_kh}</option>
          ))}
        </select>

        {isAdmin && (
          <select
            className="rounded-md border px-3 py-2 text-sm bg-background min-w-[200px]"
            value={selectedOrgId ?? ''}
            onChange={(e) => setSelectedOrgId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('selectOrganization')}</option>
            {(orgsQuery.data?.data ?? []).map((org) => (
              <option key={org.id} value={org.id}>{org.name_kh}</option>
            ))}
          </select>
        )}
      </div>

      {!canLoad ? (
        <p className="text-sm text-muted-foreground">{t('selectBoth')}</p>
      ) : (
        <QueryBoundary
          query={cardsQuery}
          loadingFallback={<CardGridSkeleton />}
          empty={<PageEmptyState message={t('noCardsFound')} />}
        >
          {(data) => (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('total', { count: data.total })}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data.cards.map((card) => (
                  <ParticipantCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          )}
        </QueryBoundary>
      )}
    </div>
  );
}

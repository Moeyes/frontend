'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, QueryBoundary, PageEmptyState, Skeleton, SectionHeader, Modal } from '@/shared/ui';
import {
  useEventSports,
  useAllSportsCatalogue,
  useAddSportToEvent,
  useRemoveSportFromEvent,
} from '../hooks';
import { EventSportOrgManager } from './EventSportOrgManager';

function SportListSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
    </div>
  );
}

interface EventSportManagerProps {
  eventId: number;
}

export function EventSportManager({ eventId }: EventSportManagerProps) {
  const t  = useTranslations('events');
  const tc = useTranslations('common');

  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [selectedQuota, setSelectedQuota]     = useState<number | ''>('');
  const [removeAssocId, setRemoveAssocId]     = useState<number | null>(null);
  const [expandedSport, setExpandedSport]     = useState<string | null>(null);

  const sportsQuery   = useEventSports(eventId);
  const catalogueQuery = useAllSportsCatalogue();
  const addMutation   = useAddSportToEvent(eventId);
  const removeMutation = useRemoveSportFromEvent(eventId);

  const attachedSportIds = new Set(
    (sportsQuery.data ?? []).map((s) => s.sports_id).filter(Boolean)
  );
  const availableSports = (catalogueQuery.data ?? []).filter(
    (s) => !attachedSportIds.has(s.id)
  );

  const handleAdd = () => {
    if (!selectedSportId) return;
    addMutation.mutate(
      { sportId: selectedSportId, quota: selectedQuota !== '' ? Number(selectedQuota) : null },
      { onSuccess: () => { setSelectedSportId(null); setSelectedQuota(''); } },
    );
  };

  return (
    <section className="space-y-3">
      <SectionHeader title={t('sports.title')} />

      <QueryBoundary query={sportsQuery} loadingFallback={<SportListSkeleton />}
        empty={<PageEmptyState message={t('sports.noSportsAssigned')} />}
      >
        {(attachedSports) => (
          <ul className="divide-y border rounded-lg">
            {attachedSports.map((sport) => {
              const associationId = sport.id ?? null;
              const sportName     = sport.sport_name ?? '—';
              const isExpanded    = expandedSport === sportName;
              const sportId       = sport.sports_id ?? null;

              return (
                <li key={associationId ?? sportName} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-medium">{sportName}</span>
                      {sport.quota != null && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {t('sports.quota')}: {sport.quota}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedSport(isExpanded ? null : sportName)}
                        aria-expanded={isExpanded}
                        disabled={!sportId}
                      >
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      {associationId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setRemoveAssocId(associationId)}
                          aria-label={tc('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {isExpanded && sportId && (
                    <EventSportOrgManager
                      eventId={eventId}
                      sportId={sportId}
                      sportName={sportName}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </QueryBoundary>

      {/* Add sport picker with optional quota */}
      {availableSports.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="text-sm border rounded px-3 py-2 flex-1 min-w-40 bg-background"
            value={selectedSportId ?? ''}
            onChange={(e) => setSelectedSportId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('selectSportPlaceholder')}</option>
            {availableSports.map((s) => (
              <option key={s.id} value={s.id}>{s.name_kh}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            placeholder={t('sports.quotaPlaceholder')}
            value={selectedQuota}
            onChange={(e) => setSelectedQuota(e.target.value ? Number(e.target.value) : '')}
            className="text-sm border rounded px-3 py-2 w-24 bg-background"
            aria-label={t('sports.quota')}
          />
          <Button
            variant="outline"
            disabled={!selectedSportId || addMutation.isPending}
            loading={addMutation.isPending}
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('addSport')}
          </Button>
        </div>
      )}

      <Modal
        open={!!removeAssocId}
        onOpenChange={(o) => { if (!o) setRemoveAssocId(null); }}
        title={tc('confirm')}
        description={t('sports.removeSportConfirm')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRemoveAssocId(null)}>{tc('cancel')}</Button>
            <Button
              variant="destructive"
              loading={removeMutation.isPending}
              onClick={() =>
                removeAssocId && removeMutation.mutate(removeAssocId, { onSettled: () => setRemoveAssocId(null) })
              }
            >
              {tc('delete')}
            </Button>
          </div>
        }
      >
        <span />
      </Modal>
    </section>
  );
}

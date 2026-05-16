'use client';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { PageHeader, BackLink, Button, QueryBoundary, PageEmptyState } from '@/shared/ui';
import { useEffectiveOrgId } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useEvent, useEventSports } from '@/modules/events';
import { useSurveyEntries } from '../hooks/useSurveyEntries';
import { createSurveyEntry, updateSurveyEntry } from '../services/survey.service';
import { surveyKeys } from '../services/keys';
import type { SportsEventPublic } from '@/modules/events';
import type { SurveyEntry } from '../services/survey.service';

interface SportCounts { male: number; female: number; existingId?: number }
type SurveyState = Record<string, SportCounts>;

function buildKey(sport: SportsEventPublic): string {
  return String(sport.sports_id ?? sport.id ?? sport.sport_name);
}

interface Props { eventId: number }

export function BySportSurveyForm({ eventId }: Props) {
  const t              = useTranslations('bysport');
  const qc             = useQueryClient();
  const organizationId = useEffectiveOrgId();

  const eventQuery   = useEvent(eventId);
  const sportsQuery  = useEventSports(eventId);
  const entriesQuery = useSurveyEntries({
    events_id:       eventId,
    organization_id: organizationId ?? undefined,
  });

  const [rows, setRows]       = useState<SurveyState>({});
  const [isPending, setIsPending] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Sync state from existing survey entries once both queries resolve.
  useEffect(() => {
    const sports  = sportsQuery.data ?? [];
    const entries: SurveyEntry[] = entriesQuery.data?.data ?? [];
    if (!sports.length) return;

    const next: SurveyState = {};
    for (const sport of sports) {
      const key = buildKey(sport);
      const existing = entries.find(
        (e) => e.sports_id === sport.sports_id || e.sports_id === sport.id
      );
      next[key] = {
        male:       existing?.athlete_male_count   ?? 0,
        female:     existing?.athlete_female_count ?? 0,
        existingId: existing?.id,
      };
    }
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setRows(next);
  }, [sportsQuery.data, entriesQuery.data]);

  const setCount = (key: string, field: 'male' | 'female', val: number) =>
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], [field]: Math.max(0, val) } }));

  const submitAll = useCallback(async () => {
    if (!organizationId) return;
    const sports = sportsQuery.data ?? [];
    if (!sports.length) return;

    setIsPending(true);
    let hadError = false;

    for (const sport of sports) {
      const key    = buildKey(sport);
      const counts = rows[key];
      if (!counts) continue;

      try {
        if (counts.existingId) {
          await updateSurveyEntry(counts.existingId, {
            athlete_male_count:   counts.male,
            athlete_female_count: counts.female,
          });
        } else {
          const created = await createSurveyEntry({
            org_id:               sport.id ?? 0,
            events_id:            eventId,
            sports_id:            sport.sports_id ?? sport.id ?? 0,
            organization_id:      organizationId,
            athlete_male_count:   counts.male,
            athlete_female_count: counts.female,
            leader_male_count:    0,
            leader_female_count:  0,
          });
          setRows((prev) => ({
            ...prev,
            [key]: { ...prev[key], existingId: created.id },
          }));
        }
      } catch {
        hadError = true;
      }
    }

    setIsPending(false);
    setLastSaved(new Date());
    void qc.invalidateQueries({ queryKey: surveyKeys.lists() });

    if (hadError) toast.error(t('submitError'));
    else          toast.success(t('submitSuccess'));
  }, [organizationId, sportsQuery.data, rows, eventId, t, qc]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      if (!organizationId || isPending) return;
      if (!(sportsQuery.data ?? []).length) return;
      submitAll().catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, [organizationId, isPending, sportsQuery.data, submitAll]);

  const sports = sportsQuery.data ?? [];
  const mid    = Math.ceil(sports.length / 2);
  const left   = sports.slice(0, mid);
  const right  = sports.slice(mid);

  const renderHalf = (half: SportsEventPublic[], startIndex: number) => (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-muted text-xs">
          <th className="border px-2 py-1.5 text-center w-9 whitespace-nowrap">{t('column.no')}</th>
          <th className="border px-2 py-1.5 text-left">{t('column.sport')}</th>
          <th className="border px-2 py-1.5 text-center w-20">{t('column.male')}</th>
          <th className="border px-2 py-1.5 text-center w-20">{t('column.female')}</th>
        </tr>
      </thead>
      <tbody>
        {half.map((sport, i) => {
          const key = buildKey(sport);
          const row = rows[key] ?? { male: 0, female: 0 };
          return (
            <tr key={key} className="hover:bg-muted/30">
              <td className="border px-2 py-1 text-center text-muted-foreground text-xs">
                {startIndex + i + 1}
              </td>
              <td className="border px-2 py-1 font-medium text-sm">
                {sport.sport_name ?? '—'}
              </td>
              <td className="border px-1 py-1">
                <input
                  type="number"
                  min={0}
                  value={row.male}
                  onChange={(e) => setCount(key, 'male', Number(e.target.value))}
                  disabled={!organizationId || isPending}
                  className="w-full rounded border px-2 py-0.5 text-center text-sm bg-background disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </td>
              <td className="border px-1 py-1">
                <input
                  type="number"
                  min={0}
                  value={row.female}
                  onChange={(e) => setCount(key, 'female', Number(e.target.value))}
                  disabled={!organizationId || isPending}
                  className="w-full rounded border px-2 py-0.5 text-center text-sm bg-background disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.surveys.home} label={t('title')} />

      <QueryBoundary query={eventQuery}>
        {(event) => <PageHeader title={t('title')} description={event.name_kh} />}
      </QueryBoundary>

      {!organizationId && (
        <div className="rounded-md bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm text-yellow-800">
          {t('orgIdMissing')}
        </div>
      )}

      <QueryBoundary
        query={sportsQuery}
        empty={<PageEmptyState message={t('noSports')} />}
      >
        {() => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="overflow-x-auto">{renderHalf(left, 0)}</div>
              <div className="overflow-x-auto">{renderHalf(right, mid)}</div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              {lastSaved ? (
                <span className="text-xs text-muted-foreground">
                  {t('draftSaved')}: {lastSaved.toLocaleTimeString()}
                </span>
              ) : (
                <span />
              )}
              <Button
                onClick={() => void submitAll()}
                disabled={!organizationId || isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('submit')}
              </Button>
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

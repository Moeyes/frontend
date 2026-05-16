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

// 8 input fields per sport row matching Excel template ចុះចំនួន tab
interface SportRow {
  delegate_m: number; delegate_f: number;
  leader_m:   number; leader_f:   number;
  coach_m:    number; coach_f:    number;
  athlete_m:  number; athlete_f:  number;
  existingId?: number;
}
type ByNumberState = Record<string, SportRow>;

function emptyRow(): SportRow {
  return { delegate_m: 0, delegate_f: 0, leader_m: 0, leader_f: 0,
           coach_m: 0, coach_f: 0, athlete_m: 0, athlete_f: 0 };
}

// Formulas from REPORTS_SPEC.md RPT-3 (cols K, L, M, N)
function subtotalM(r: SportRow)       { return r.delegate_m + r.leader_m + r.coach_m; }
function subtotalF(r: SportRow)       { return r.delegate_f + r.leader_f + r.coach_f; }
function subtotalAthletes(r: SportRow) { return r.athlete_m + r.athlete_f; }
function grandTotal(r: SportRow)      { return subtotalM(r) + subtotalF(r) + subtotalAthletes(r); }

function buildKey(sport: SportsEventPublic): string {
  return String(sport.sports_id ?? sport.id ?? sport.sport_name);
}

interface NumInputProps { value: number; onChange: (v: number) => void; disabled: boolean }
function NumInput({ value, onChange, disabled }: NumInputProps) {
  return (
    <input
      type="number" min={0} value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      disabled={disabled}
      className="w-14 rounded border px-1 py-0.5 text-center text-sm bg-background disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}

interface Props { eventId: number }

export function ByNumberSurveyForm({ eventId }: Props) {
  const t              = useTranslations('bynumber');
  const qc             = useQueryClient();
  const organizationId = useEffectiveOrgId();

  const eventQuery   = useEvent(eventId);
  const sportsQuery  = useEventSports(eventId);
  const entriesQuery = useSurveyEntries({
    events_id:       eventId,
    organization_id: organizationId ?? undefined,
  });

  const [rows, setRows]           = useState<ByNumberState>({});
  const [isPending, setIsPending] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const sports  = sportsQuery.data ?? [];
    const entries: SurveyEntry[] = entriesQuery.data?.data ?? [];
    if (!sports.length) return;

    const next: ByNumberState = {};
    for (const sport of sports) {
      const key      = buildKey(sport);
      const existing = entries.find(
        (e) => e.sports_id === sport.sports_id || e.sports_id === sport.id
      );
      // Backend stores leader_male = delegate+leader+coach combined (backend limitation).
      // On load, surface that combined value in the coach column as the best-effort restore.
      next[key] = existing
        ? { delegate_m: 0, delegate_f: 0, leader_m: 0, leader_f: 0,
            coach_m:   existing.leader_male_count   ?? 0,
            coach_f:   existing.leader_female_count ?? 0,
            athlete_m: existing.athlete_male_count  ?? 0,
            athlete_f: existing.athlete_female_count ?? 0,
            existingId: existing.id }
        : { ...emptyRow() };
    }
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setRows(next);
  }, [sportsQuery.data, entriesQuery.data]);

  const setField = (key: string, field: keyof Omit<SportRow, 'existingId'>, val: number) =>
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], [field]: Math.max(0, val) } }));

  const submitAll = useCallback(async () => {
    if (!organizationId) return;
    const sports = sportsQuery.data ?? [];
    if (!sports.length) return;

    setIsPending(true);
    let hadError = false;

    for (const sport of sports) {
      const key = buildKey(sport);
      const row = rows[key];
      if (!row) continue;

      // Map to backend schema (4 fields): athlete M/F + combined non-athlete M/F
      const update = {
        athlete_male_count:   row.athlete_m,
        athlete_female_count: row.athlete_f,
        leader_male_count:    row.delegate_m + row.leader_m + row.coach_m,
        leader_female_count:  row.delegate_f + row.leader_f + row.coach_f,
      };

      try {
        if (row.existingId) {
          await updateSurveyEntry(row.existingId, update);
        } else {
          const created = await createSurveyEntry({
            ...update,
            org_id:          sport.id ?? 0,
            events_id:       eventId,
            sports_id:       sport.sports_id ?? sport.id ?? 0,
            organization_id: organizationId,
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
    void qc.invalidateQueries({ queryKey: surveyKeys.lists() });
    if (hadError) toast.error(t('submitError'));
    else { toast.success(t('submitSuccess')); setLastSaved(new Date()); }
  }, [organizationId, sportsQuery.data, rows, eventId, t, qc]);

  const sports = sportsQuery.data ?? [];

  const totals = Object.values(rows).reduce(
    (acc, r) => ({
      delegate_m: acc.delegate_m + r.delegate_m, delegate_f: acc.delegate_f + r.delegate_f,
      leader_m:   acc.leader_m   + r.leader_m,   leader_f:   acc.leader_f   + r.leader_f,
      coach_m:    acc.coach_m    + r.coach_m,     coach_f:    acc.coach_f    + r.coach_f,
      athlete_m:  acc.athlete_m  + r.athlete_m,   athlete_f:  acc.athlete_f  + r.athlete_f,
    }),
    emptyRow()
  );

  const muted    = 'border px-2 py-1.5 text-center text-xs whitespace-nowrap bg-muted';
  const mutedSub = 'border px-2 py-1.5 text-center text-xs whitespace-nowrap bg-blue-50';

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

      <QueryBoundary query={sportsQuery} empty={<PageEmptyState message={t('noSports')} />}>
        {() => (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border">
              <table className="text-sm border-collapse" style={{ minWidth: '56rem' }}>
                <thead>
                  {/* Row 1: group labels */}
                  <tr>
                    <th rowSpan={2} className={`${muted} w-9`}>{t('column.no')}</th>
                    <th rowSpan={2} className={`${muted} min-w-[8rem] text-left px-3`}>{t('column.sport')}</th>
                    <th colSpan={2} className={muted}>{t('column.delegate')}</th>
                    <th colSpan={2} className={muted}>{t('column.leader')}</th>
                    <th colSpan={2} className={muted}>{t('column.coach')}</th>
                    <th colSpan={2} className={muted}>{t('column.athlete')}</th>
                    {/* 3 computed sub-total cols + grand total */}
                    <th colSpan={2} className={mutedSub}>{t('column.subtotal')}</th>
                    <th className={`${mutedSub} w-14`}>{'សរុប'}</th>
                    <th rowSpan={2} className={`${mutedSub} w-16`}>{t('column.grandtotal')}</th>
                  </tr>
                  {/* Row 2: M/F sub-headers */}
                  <tr>
                    {/* delegate, leader, coach, athlete × M/F = 8 */}
                    {['delegate', 'leader', 'coach', 'athlete'].flatMap((g) => [
                      <th key={`${g}m`} className={`${muted} w-14`}>{t('column.male')}</th>,
                      <th key={`${g}f`} className={`${muted} w-14`}>{t('column.female')}</th>,
                    ])}
                    {/* subtotal M/F + athlete combined */}
                    <th className={`${mutedSub} w-14`}>{t('column.male')}</th>
                    <th className={`${mutedSub} w-14`}>{t('column.female')}</th>
                    <th className={`${mutedSub} w-14`}>{'ប+ស'}</th>
                  </tr>
                </thead>
                <tbody>
                  {sports.map((sport, i) => {
                    const key = buildKey(sport);
                    const row = rows[key] ?? emptyRow();
                    const stM  = subtotalM(row);
                    const stF  = subtotalF(row);
                    const stAt = subtotalAthletes(row);
                    const gt   = grandTotal(row);
                    return (
                      <tr key={key} className="hover:bg-muted/20">
                        <td className="border px-2 py-1 text-center text-xs text-muted-foreground">{i + 1}</td>
                        <td className="border px-3 py-1 font-medium text-sm whitespace-nowrap">{sport.sport_name ?? '—'}</td>
                        {/* delegate */}
                        <td className="border px-1 py-0.5"><NumInput value={row.delegate_m} onChange={(v) => setField(key, 'delegate_m', v)} disabled={!organizationId || isPending} /></td>
                        <td className="border px-1 py-0.5"><NumInput value={row.delegate_f} onChange={(v) => setField(key, 'delegate_f', v)} disabled={!organizationId || isPending} /></td>
                        {/* leader */}
                        <td className="border px-1 py-0.5"><NumInput value={row.leader_m} onChange={(v) => setField(key, 'leader_m', v)} disabled={!organizationId || isPending} /></td>
                        <td className="border px-1 py-0.5"><NumInput value={row.leader_f} onChange={(v) => setField(key, 'leader_f', v)} disabled={!organizationId || isPending} /></td>
                        {/* coach */}
                        <td className="border px-1 py-0.5"><NumInput value={row.coach_m} onChange={(v) => setField(key, 'coach_m', v)} disabled={!organizationId || isPending} /></td>
                        <td className="border px-1 py-0.5"><NumInput value={row.coach_f} onChange={(v) => setField(key, 'coach_f', v)} disabled={!organizationId || isPending} /></td>
                        {/* athlete */}
                        <td className="border px-1 py-0.5"><NumInput value={row.athlete_m} onChange={(v) => setField(key, 'athlete_m', v)} disabled={!organizationId || isPending} /></td>
                        <td className="border px-1 py-0.5"><NumInput value={row.athlete_f} onChange={(v) => setField(key, 'athlete_f', v)} disabled={!organizationId || isPending} /></td>
                        {/* computed subtotals */}
                        <td className="border px-2 py-1 text-center text-sm bg-blue-50/40 font-medium">{stM}</td>
                        <td className="border px-2 py-1 text-center text-sm bg-blue-50/40 font-medium">{stF}</td>
                        <td className="border px-2 py-1 text-center text-sm bg-blue-50/40 font-medium">{stAt}</td>
                        {/* grand total */}
                        <td className="border px-2 py-1 text-center text-sm bg-blue-100/60 font-bold">{gt}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted font-bold text-sm">
                    <td colSpan={2} className="border px-3 py-1.5 text-right text-xs">{t('totalRow')}</td>
                    <td className="border px-2 py-1 text-center">{totals.delegate_m}</td>
                    <td className="border px-2 py-1 text-center">{totals.delegate_f}</td>
                    <td className="border px-2 py-1 text-center">{totals.leader_m}</td>
                    <td className="border px-2 py-1 text-center">{totals.leader_f}</td>
                    <td className="border px-2 py-1 text-center">{totals.coach_m}</td>
                    <td className="border px-2 py-1 text-center">{totals.coach_f}</td>
                    <td className="border px-2 py-1 text-center">{totals.athlete_m}</td>
                    <td className="border px-2 py-1 text-center">{totals.athlete_f}</td>
                    <td className="border px-2 py-1 text-center">{subtotalM(totals)}</td>
                    <td className="border px-2 py-1 text-center">{subtotalF(totals)}</td>
                    <td className="border px-2 py-1 text-center">{subtotalAthletes(totals)}</td>
                    <td className="border px-2 py-1 text-center">{grandTotal(totals)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              {lastSaved ? (
                <span className="text-xs text-muted-foreground">
                  {'បានរក្សាទុក'}: {lastSaved.toLocaleTimeString()}
                </span>
              ) : <span />}
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

import { useMemo } from 'react';
import { useEvent, useEventSports } from '@/modules/events';
import { useOrganization } from '@/modules/organizations';
import { useSurveyEntries } from '@/modules/survey';
import { useRegistrations } from '@/modules/registration-flow';
import type { Rpt3Input, Rpt3SportRow } from '../lib/rpt3-excel';
import type { Rpt5Input, Rpt5PersonRow } from '../lib/rpt5-excel';

interface ReportParams {
  orgId:    number;
  eventId:  number;
}

function parseDob(dob: string | null | undefined): { day: string; month: string; year: string } {
  if (!dob) return { day: '', month: '', year: '' };
  const d = new Date(dob);
  if (isNaN(d.getTime())) return { day: dob, month: '', year: '' };
  return {
    day:   String(d.getDate()),
    month: String(d.getMonth() + 1),
    year:  String(d.getFullYear()),
  };
}

function genderLabel(g: string | null | undefined): string {
  if (!g) return '';
  return g === 'MALE' ? 'ប' : 'ស';
}

// ────────────────────────────────────────────────────────────────────────────
// RPT-3 data hook
// ────────────────────────────────────────────────────────────────────────────
export function useRpt3Data(params: ReportParams | null): {
  data:      Rpt3Input | null;
  isLoading: boolean;
  error:     Error | null;
} {
  const eventQuery  = useEvent(params?.eventId ?? 0);
  const orgQuery    = useOrganization(params?.orgId ?? 0);
  const sportsQuery = useEventSports(params?.eventId ?? 0);
  const surveyQuery = useSurveyEntries(
    params
      ? { events_id: params.eventId, organization_id: params.orgId }
      : undefined
  );

  const isLoading = !params
    || eventQuery.isLoading || orgQuery.isLoading
    || sportsQuery.isLoading || surveyQuery.isLoading;

  const error = eventQuery.error ?? orgQuery.error ?? sportsQuery.error ?? surveyQuery.error ?? null;

  const data = useMemo<Rpt3Input | null>(() => {
    if (!params || isLoading || error) return null;
    const event  = eventQuery.data;
    const org    = orgQuery.data;
    const sports = sportsQuery.data ?? [];
    const entries = surveyQuery.data?.data ?? [];

    if (!event || !org) return null;

    const sportRows: Rpt3SportRow[] = sports.map((s, i) => {
      const entry = entries.find(
        (e) => e.sports_id === s.sports_id || e.sports_id === s.id
      );
      // Backend limitation: leader_male/female combines delegate+leader+coach.
      // We surface it in the coach column; delegate and leader stay 0.
      return {
        no:         i + 1,
        sport_name: s.sport_name ?? `Sport ${i + 1}`,
        delegate_m: 0,
        delegate_f: 0,
        leader_m:   0,
        leader_f:   0,
        coach_m:    entry?.leader_male_count   ?? 0,
        coach_f:    entry?.leader_female_count ?? 0,
        athlete_m:  entry?.athlete_male_count  ?? 0,
        athlete_f:  entry?.athlete_female_count ?? 0,
      };
    });

    return {
      orgName:   org.name_kh,
      eventName: event.name_kh,
      sports:    sportRows,
    };
  }, [params, isLoading, error, eventQuery.data, orgQuery.data, sportsQuery.data, surveyQuery.data]);

  return { data, isLoading, error: error as Error | null };
}

// ────────────────────────────────────────────────────────────────────────────
// RPT-5 data hook
// ────────────────────────────────────────────────────────────────────────────
export function useRpt5Data(params: ReportParams | null): {
  data:      Rpt5Input | null;
  isLoading: boolean;
  error:     Error | null;
} {
  const eventQuery    = useEvent(params?.eventId ?? 0);
  const orgQuery      = useOrganization(params?.orgId ?? 0);
  const sportsQuery   = useEventSports(params?.eventId ?? 0);
  const athleteQuery  = useRegistrations(
    params
      ? { role: 'athlete', organization_id: params.orgId, event_id: params.eventId, limit: 500 }
      : { role: 'athlete' }
  );
  const leaderQuery   = useRegistrations(
    params
      ? { role: 'leader', organization_id: params.orgId, event_id: params.eventId, limit: 500 }
      : { role: 'leader' }
  );

  const isLoading = !params
    || eventQuery.isLoading || orgQuery.isLoading || sportsQuery.isLoading
    || athleteQuery.isLoading || leaderQuery.isLoading;

  const error = eventQuery.error ?? orgQuery.error ?? sportsQuery.error
    ?? athleteQuery.error ?? leaderQuery.error ?? null;

  const data = useMemo<Rpt5Input | null>(() => {
    if (!params || isLoading || error) return null;
    const event   = eventQuery.data;
    const org     = orgQuery.data;
    const sports  = sportsQuery.data ?? [];
    const athletes = athleteQuery.data ?? [];
    const leaders  = leaderQuery.data ?? [];

    if (!event || !org) return null;

    const sportNameById = new Map<number, string>(
      sports.map((s) => [s.sports_id ?? s.id ?? 0, s.sport_name ?? ''])
    );

    // Combine leaders first, then athletes — sorted by sport then role
    const allPeople = [
      ...leaders.map((p) => ({ ...p, _sortRole: 0 })),
      ...athletes.map((p) => ({ ...p, _sortRole: 1 })),
    ].sort((a, b) => {
      const sportA = a.sport_id ?? 0;
      const sportB = b.sport_id ?? 0;
      if (sportA !== sportB) return sportA - sportB;
      return a._sortRole - b._sortRole;
    });

    const people: Rpt5PersonRow[] = allPeople.map((p, i) => {
      const { day, month, year } = parseDob(p.date_of_birth);
      const khName = [p.kh_family_name, p.kh_given_name].filter(Boolean).join(' ');
      const enName = [p.en_family_name, p.en_given_name].filter(Boolean).join(' ');
      const roleLabel = p.role === 'athlete'
        ? (p.gender === 'MALE' ? 'កីឡាករ' : 'កីឡាការិនី')
        : (p.leader_role ?? 'ប្រតិភូ');

      return {
        no:           i + 1,
        full_name_kh: khName || enName,
        gender:       genderLabel(p.gender),
        dob_day:      day,
        dob_month:    month,
        dob_year:     year,
        nationality:  '', // backend gap: not stored
        id_number:    '', // backend gap: only URLs stored, not numbers
        role:         roleLabel,
        sport_name:   sportNameById.get(p.sport_id ?? 0) ?? `#${p.sport_id ?? '?'}`,
        notes:        '',
      };
    });

    return { orgName: org.name_kh, eventName: event.name_kh, people };
  }, [params, isLoading, error, eventQuery.data, orgQuery.data, sportsQuery.data, athleteQuery.data, leaderQuery.data]);

  return { data, isLoading, error: error as Error | null };
}

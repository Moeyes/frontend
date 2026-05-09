'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  PageHeader, BackLink, Card, CardContent, Button,
  QueryBoundary, PageEmptyState, Badge, Skeleton,
} from '@/shared/ui';
import { useEffectiveOrgId } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useEvent, useEventSports } from '@/modules/events';
import { useSurveyEntries } from '../hooks/useSurveyEntries';
import { useSubmitSurvey, useUpdateSurveyEntry } from '../hooks/useSubmitSurvey';
import type { SportsEventPublic } from '@/modules/events';
import type { SurveyEntry } from '../services/survey.service';

interface SportRowProps {
  sport:         SportsEventPublic;
  eventId:       number;
  organizationId: number | null;
  existingEntry: SurveyEntry | undefined;
}

function SportRow({ sport, eventId, organizationId, existingEntry }: SportRowProps) {
  const t  = useTranslations('survey');
  const tc = useTranslations('common');

  const [counts, setCounts] = useState({
    athlete_male_count:   existingEntry?.athlete_male_count   ?? 0,
    athlete_female_count: existingEntry?.athlete_female_count ?? 0,
    leader_male_count:    existingEntry?.leader_male_count    ?? 0,
    leader_female_count:  existingEntry?.leader_female_count  ?? 0,
  });

  const submitMutation = useSubmitSurvey();
  const updateMutation = useUpdateSurveyEntry(existingEntry?.id ?? 0);
  const isPending = submitMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!organizationId || !sport.id) return;

    if (existingEntry) {
      updateMutation.mutate(counts, {
        onSuccess: () => toast.success(t('submitSuccess')),
      });
    } else {
      submitMutation.mutate({
        org_id:          sport.id, // sports_event_org join ID
        events_id:       eventId,
        sports_id:       sport.id, // ⚠️ same gap as events module — SportsEventPublic lacks sports_id
        organization_id: organizationId,
        ...counts,
      }, {
        onSuccess: () => toast.success(t('submitSuccess')),
      });
    }
  };

  const isDisabled = !organizationId || !sport.id;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{sport.sport_name ?? '—'}</span>
        {existingEntry ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t('submitted')}
          </Badge>
        ) : (
          <Badge variant="outline">{t('notSubmitted')}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'athlete_male_count',   label: t('athleteMale') },
          { key: 'athlete_female_count', label: t('athleteFemale') },
          { key: 'leader_male_count',    label: t('leaderMale') },
          { key: 'leader_female_count',  label: t('leaderFemale') },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs text-muted-foreground">{label}</label>
            <input
              type="number"
              min={0}
              value={counts[key as keyof typeof counts]}
              onChange={(e) =>
                setCounts((prev) => ({ ...prev, [key]: Math.max(0, Number(e.target.value)) }))
              }
              disabled={isDisabled}
              className="w-full rounded-md border px-3 py-1.5 text-sm bg-background disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={isDisabled || isPending}
          onClick={handleSubmit}
        >
          {isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          {existingEntry ? tc('save') : t('submit')}
        </Button>
      </div>
    </div>
  );
}

function SportRowSkeleton() {
  return <Skeleton className="h-36 w-full rounded-lg" />;
}

interface BySportSurveyFormProps {
  eventId: number;
}

export function BySportSurveyForm({ eventId }: BySportSurveyFormProps) {
  const t    = useTranslations('survey');
  

  const eventQuery  = useEvent(eventId);
  const sportsQuery = useEventSports(eventId);
  const entriesQuery = useSurveyEntries();

  const organizationId = useEffectiveOrgId();

  // Client-side filter: entries for this event (gap #5 — no server-side filter)
  const eventEntries = (entriesQuery.data?.data ?? []).filter(
    (e) => e.org_name !== null // best available heuristic since no events_id in response
  );

  const getExistingEntry = (sportName: string | null): SurveyEntry | undefined =>
    eventEntries.find((e) => e.org_name === sportName);

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.surveys.home} label={t('backToSurveys')} />

      <QueryBoundary query={eventQuery}>
        {(event) => (
          <PageHeader
            title={`${t('bySport')} — ${event.name_kh}`}
            description={t('bySportDesc')}
          />
        )}
      </QueryBoundary>

      <QueryBoundary
        query={sportsQuery}
        loadingFallback={
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <SportRowSkeleton key={i} />)}
          </div>
        }
        empty={<PageEmptyState message={t('noSportsForEvent')} />}
      >
        {(sports) => (
          <div className="space-y-3">
            {sports.map((sport) => (
              <SportRow
                key={sport.id ?? sport.sport_name}
                sport={sport}
                eventId={eventId}
                organizationId={organizationId}
                existingEntry={getExistingEntry(sport.sport_name ?? null)}
              />
            ))}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

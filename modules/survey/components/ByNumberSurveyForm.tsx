'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { PageHeader, BackLink, Card, CardContent, Button, QueryBoundary } from '@/shared/ui';
import { useEffectiveOrgId } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useEvent, useEventSports } from '@/modules/events';
import { useSubmitSurvey } from '../hooks/useSubmitSurvey';
import { OrgSelectorBanner } from '@/shared/ui';

interface ByNumberSurveyFormProps {
  eventId: number;
}

export function ByNumberSurveyForm({ eventId }: ByNumberSurveyFormProps) {
  const t    = useTranslations('survey');
  const tc   = useTranslations('common');
  const eventQuery  = useEvent(eventId);
  const sportsQuery = useEventSports(eventId);
  const mutation    = useSubmitSurvey();

  const organizationId = useEffectiveOrgId();

  const [counts, setCounts] = useState({
    athlete_male_count:   0,
    athlete_female_count: 0,
    leader_male_count:    0,
    leader_female_count:  0,
  });

  const handleSubmit = () => {
    if (!organizationId) return;
    const sports = sportsQuery.data ?? [];
    if (!sports.length) return;

    // Submit one entry for the first sport (by-number = total across all sports)
    const sport = sports[0];
    mutation.mutate({
      org_id:          sport.id ?? 0,
      events_id:       eventId,
      sports_id:       sport.id ?? 0,
      organization_id: organizationId,
      ...counts,
    }, {
      onSuccess: () => toast.success(t('submitSuccess')),
    });
  };

  const isDisabled = !organizationId || mutation.isPending;

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.surveys.home} label={t('backToSurveys')} />

      <QueryBoundary query={eventQuery}>
        {(event) => (
          <PageHeader
            title={`${t('byNumber')} — ${event.name_kh}`}
            description={t('byNumberHint')}
          />
        )}
      </QueryBoundary>

      {!organizationId && <OrgSelectorBanner />}

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: 'athlete_male_count',   label: t('athleteMale') },
              { key: 'athlete_female_count', label: t('athleteFemale') },
              { key: 'leader_male_count',    label: t('leaderMale') },
              { key: 'leader_female_count',  label: t('leaderFemale') },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm text-muted-foreground">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={counts[key as keyof typeof counts]}
                  onChange={(e) =>
                    setCounts((p) => ({ ...p, [key]: Math.max(0, Number(e.target.value)) }))
                  }
                  disabled={isDisabled}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            {t('totalAthletes')}: {counts.athlete_male_count + counts.athlete_female_count}
            &nbsp;·&nbsp;
            {t('totalLeaders')}: {counts.leader_male_count + counts.leader_female_count}
          </div>

          <Button disabled={isDisabled} onClick={handleSubmit}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('submit')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

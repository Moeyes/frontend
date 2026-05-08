'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  PageHeader, BackLink, Card, CardContent, Button,
  QueryBoundary, PageEmptyState,
} from '@/shared/ui';
import { useAuth } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useEvent, useEventSports } from '@/modules/events';
import { useCategories } from '@/modules/sports';
import { useSubmitSurvey } from '../hooks/useSubmitSurvey';
import { OrgIdGapBanner } from './OrgIdGapBanner';
import type { SportsEventPublic } from '@/modules/events';

interface CategoryCountRow {
  category: string;
  male: number;
  female: number;
}

interface SportCategoryPanelProps {
  sport:          SportsEventPublic;
  eventId:        number;
  organizationId: number | null;
}

function SportCategoryPanel({ sport, eventId, organizationId }: SportCategoryPanelProps) {
  const t       = useTranslations('survey');
  const tc      = useTranslations('common');
  const sportId = 0; // Backend gap: SportsEventPublic lacks sports_id — use 0 as placeholder

  const catQuery = useCategories(eventId, sportId);
  const mutation = useSubmitSurvey();

  const [rows, setRows] = useState<CategoryCountRow[]>([
    { category: 'default', male: 0, female: 0 },
  ]);

  const totalM = rows.reduce((s, r) => s + r.male, 0);
  const totalF = rows.reduce((s, r) => s + r.female, 0);

  const handleSubmit = () => {
    if (!organizationId || !sport.id) return;
    mutation.mutate({
      org_id:          sport.id,
      events_id:       eventId,
      sports_id:       sport.id,
      organization_id: organizationId,
      athlete_male_count:   totalM,
      athlete_female_count: totalF,
      leader_male_count:    0,
      leader_female_count:  0,
    }, {
      onSuccess: () => toast.success(t('submitSuccess')),
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <p className="font-medium text-sm">{sport.sport_name ?? '—'}</p>

      {/* Gap notice: sports_id needed for real categories */}
      {sportId === 0 && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{t('categoryGapNote')}</span>
        </div>
      )}

      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 items-center">
            <span className="text-sm">{row.category}</span>
            <div className="space-y-0.5">
              <label className="text-xs text-muted-foreground">{t('athleteMale')}</label>
              <input type="number" min={0} value={row.male}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...next[i], male: Math.max(0, Number(e.target.value)) };
                  setRows(next);
                }}
                className="w-full rounded-md border px-2 py-1 text-sm bg-background"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-xs text-muted-foreground">{t('athleteFemale')}</label>
              <input type="number" min={0} value={row.female}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...next[i], female: Math.max(0, Number(e.target.value)) };
                  setRows(next);
                }}
                className="w-full rounded-md border px-2 py-1 text-sm bg-background"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t('total')}: M={totalM} F={totalF}
        </span>
        <Button
          size="sm"
          disabled={!organizationId || mutation.isPending}
          onClick={handleSubmit}
        >
          {mutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          {t('submit')}
        </Button>
      </div>
    </div>
  );
}

interface ByCategorySurveyFormProps {
  eventId: number;
}

export function ByCategorySurveyForm({ eventId }: ByCategorySurveyFormProps) {
  const t    = useTranslations('survey');
  const { user } = useAuth();
  const eventQuery  = useEvent(eventId);
  const sportsQuery = useEventSports(eventId);
  const organizationId = user?.organization_id ?? null;

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.surveys.home} label={t('backToSurveys')} />

      <QueryBoundary query={eventQuery}>
        {(event) => (
          <PageHeader
            title={`${t('byCategory')} — ${event.name_kh}`}
            description={t('byCategoryHint')}
          />
        )}
      </QueryBoundary>

      {!organizationId && <OrgIdGapBanner />}

      <QueryBoundary
        query={sportsQuery}
        empty={<PageEmptyState message={t('noSportsForEvent')} />}
      >
        {(sports) => (
          <div className="space-y-3">
            {sports.map((sport) => (
              <SportCategoryPanel
                key={sport.id ?? sport.sport_name}
                sport={sport}
                eventId={eventId}
                organizationId={organizationId}
              />
            ))}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

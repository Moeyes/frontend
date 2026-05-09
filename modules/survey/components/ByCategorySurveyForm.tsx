'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  PageHeader, BackLink, Card, CardContent, Button,
  QueryBoundary, PageEmptyState, Skeleton,
} from '@/shared/ui';
import { useEffectiveOrgId } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useEvent, useEventSports } from '@/modules/events';
import { useCategories } from '@/modules/sports';
import { useSubmitSurvey } from '../hooks/useSubmitSurvey';
import type { SportsEventPublic } from '@/modules/events';
import type { CategoryPublic } from '@/modules/sports';

// ── Per-category M/F state ────────────────────────────────────────────────────

interface CatCounts { male: number; female: number }

interface SportCategoryPanelProps {
  sport:          SportsEventPublic;
  eventId:        number;
  organizationId: number | null;
}

function SportCategoryPanel({ sport, eventId, organizationId }: SportCategoryPanelProps) {
  const t       = useTranslations('survey');
  const tc      = useTranslations('common');
  const sportId = sport.sports_id ?? 0;

  const catQuery = useCategories(eventId, sportId);
  const mutation = useSubmitSurvey();

  const [counts, setCounts] = useState<Record<number, CatCounts>>({});

  const getCount = (catId: number): CatCounts =>
    counts[catId] ?? { male: 0, female: 0 };

  const setCount = (catId: number, field: 'male' | 'female', val: number) =>
    setCounts((prev) => ({
      ...prev,
      [catId]: { ...getCount(catId), [field]: Math.max(0, val) },
    }));

  const handleSubmit = async (categories: CategoryPublic[]) => {
    if (!organizationId || !sport.id) return;

    const entries = categories.map((cat) => {
      const c = getCount(cat.id);
      return {
        org_id:               sport.id!,
        events_id:            eventId,
        sports_id:            sportId,
        organization_id:      organizationId,
        category_id:          cat.id,
        athlete_male_count:   c.male,
        athlete_female_count: c.female,
        leader_male_count:    0,
        leader_female_count:  0,
      };
    });

    let successCount = 0;
    for (const entry of entries) {
      await new Promise<void>((resolve) => {
        mutation.mutate(entry, {
          onSuccess: () => { successCount++; resolve(); },
          onError:   () => resolve(),
        });
      });
    }
    if (successCount > 0) toast.success(t('submitSuccess'));
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <p className="font-medium text-sm">{sport.sport_name ?? '—'}</p>

        <QueryBoundary
          query={catQuery}
          loadingFallback={<Skeleton className="h-8 w-full" />}
          empty={<p className="text-xs text-muted-foreground">{t('noCategoriesForSport')}</p>}
        >
          {(categories) => (
            <>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-sm">
                      {cat.category}
                      {cat.gender && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({cat.gender})
                        </span>
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <label className="text-xs text-muted-foreground">{t('athleteMale')}</label>
                      <input
                        type="number" min={0}
                        value={getCount(cat.id).male}
                        onChange={(e) => setCount(cat.id, 'male', Number(e.target.value))}
                        className="w-full rounded-md border px-2 py-1 text-sm bg-background"
                        aria-label={`${cat.category} ${t('athleteMale')}`}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-xs text-muted-foreground">{t('athleteFemale')}</label>
                      <input
                        type="number" min={0}
                        value={getCount(cat.id).female}
                        onChange={(e) => setCount(cat.id, 'female', Number(e.target.value))}
                        className="w-full rounded-md border px-2 py-1 text-sm bg-background"
                        aria-label={`${cat.category} ${t('athleteFemale')}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  disabled={!organizationId || mutation.isPending || sportId === 0}
                  onClick={() => handleSubmit(categories)}
                >
                  {mutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {t('submit')}
                </Button>
              </div>
            </>
          )}
        </QueryBoundary>
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface ByCategorySurveyFormProps {
  eventId: number;
}

export function ByCategorySurveyForm({ eventId }: ByCategorySurveyFormProps) {
  const t = useTranslations('survey');

  const eventQuery     = useEvent(eventId);
  const sportsQuery    = useEventSports(eventId);
  const organizationId = useEffectiveOrgId();

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

      <QueryBoundary
        query={sportsQuery}
        empty={<PageEmptyState message={t('noSportsForEvent')} />}
      >
        {(sports) => (
          <div className="space-y-3">
            {sports.map((sport) => (
              <SportCategoryPanel
                key={sport.id}
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

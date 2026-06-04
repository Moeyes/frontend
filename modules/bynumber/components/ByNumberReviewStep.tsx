'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import type { ByNumberFormInput, ByNumberFormData, Event, Organization } from '../types';

interface ByNumberReviewStepProps {
    form: UseFormReturn<ByNumberFormInput, unknown, ByNumberFormData>;
    events: Event[];
    organizations: Organization[];
}

export function ByNumberReviewStep({ form, events, organizations }: ByNumberReviewStepProps) {
    const { watch } = form;
    const t = useTranslations('bynumber');
    const selectedEventId = watch('eventId');
    const selectedOrgId = watch('organizationId');
    const sports = watch('sports') || [];

    const selectedEvent = events.find((e) => e.id === selectedEventId);
    const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

    const totalAthletes = sports.reduce(
        (sum, s) => sum + s.athlete_male_count + s.athlete_female_count,
        0,
    );
    const totalLeaders = sports.reduce(
        (sum, s) => sum + s.leader_male_count + s.leader_female_count,
        0,
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <h4 className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{t('review.event')}</h4>
                    <p className="font-medium leading-relaxed text-foreground">{selectedEvent?.name_kh}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <h4 className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{t('review.organization')}</h4>
                    <p className="font-medium leading-relaxed text-foreground">{selectedOrg?.name_kh}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs leading-relaxed text-muted-foreground">{t('review.totalAthletes')}</p>
                    <p className="text-2xl font-semibold text-primary">{totalAthletes}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs leading-relaxed text-muted-foreground">{t('review.totalLeaders')}</p>
                    <p className="text-2xl font-semibold text-primary">{totalLeaders}</p>
                </div>
            </div>
            <div>
                <p className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{t('review.breakdown')}</p>
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted text-xs font-medium leading-relaxed text-muted-foreground">
                                <th className="px-3 py-2.5 text-left">{t('table.sport')}</th>
                                <th className="px-3 py-2.5 text-right">{t('review.athletes')}</th>
                                <th className="px-3 py-2.5 text-right">{t('review.leaders')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {sports.map((sport) => (
                                <tr key={sport.sport_id}>
                                    <td className="px-3 py-2.5 font-medium leading-relaxed text-foreground">{sport.sport_name_kh}</td>
                                    <td className="px-3 py-2.5 text-right leading-relaxed text-foreground">
                                        {sport.athlete_male_count + sport.athlete_female_count}
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            (M:{sport.athlete_male_count} F:{sport.athlete_female_count})
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-right leading-relaxed text-foreground">
                                        {sport.leader_male_count + sport.leader_female_count}
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            (M:{sport.leader_male_count} F:{sport.leader_female_count})
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

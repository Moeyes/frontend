'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/utils/cn';
import type { ByNumberFormInput, ByNumberFormData, SportRow } from '../types';

interface ByNumberSportsTableProps {
    form: UseFormReturn<ByNumberFormInput, unknown, ByNumberFormData>;
}

const countInput =
    'w-20 rounded-md border border-input px-2 py-1.5 text-right text-sm tabular-nums focus:border-primary focus:ring-1 focus:ring-ring';

function CountCell({
    value,
    onChange,
}: {
    value: number;
    onChange: (val: number) => void;
}) {
    return (
        <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className={countInput}
        />
    );
}

export function ByNumberSportsTable({ form }: ByNumberSportsTableProps) {
    const { watch, setValue } = form;
    const t = useTranslations('bynumber');
    const sports = watch('sports') || [];

    if (sports.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
                <p className="font-medium leading-relaxed text-foreground">{t('noSportsTitle')}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t('noSportsHint')}</p>
            </div>
        );
    }

    const updateSport = (index: number, field: keyof SportRow, val: number) => {
        const updated = [...sports];
        updated[index] = { ...updated[index], [field]: val };
        setValue('sports', updated);
    };

    const totalAthleteM = sports.reduce((s, sp) => s + (sp.athlete_male_count || 0), 0);
    const totalAthleteF = sports.reduce((s, sp) => s + (sp.athlete_female_count || 0), 0);
    const totalLeaderM = sports.reduce((s, sp) => s + (sp.leader_male_count || 0), 0);
    const totalLeaderF = sports.reduce((s, sp) => s + (sp.leader_female_count || 0), 0);
    const grandTotal = totalAthleteM + totalAthleteF + totalLeaderM + totalLeaderF;

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-muted text-xs font-medium leading-relaxed text-muted-foreground">
                            <th className="sticky left-0 z-20 border-r border-border bg-muted px-3 py-3 text-left">{t('table.sport')}</th>
                            <th className="border-l border-border px-3 py-3 text-right">{t('table.athleteM')}</th>
                            <th className="px-3 py-3 text-right">{t('table.athleteF')}</th>
                            <th className="border-l border-border px-3 py-3 text-right">{t('table.leaderM')}</th>
                            <th className="px-3 py-3 text-right">{t('table.leaderF')}</th>
                            <th className="border-l border-border bg-accent/60 px-3 py-3 text-right">{t('table.subtotal')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                        {sports.map((sport, index) => {
                            const subtotal =
                                (sport.athlete_male_count || 0) +
                                (sport.athlete_female_count || 0) +
                                (sport.leader_male_count || 0) +
                                (sport.leader_female_count || 0);
                            const filled = subtotal > 0;
                            return (
                                <tr
                                    key={sport.sport_id}
                                    className={cn('transition-colors', filled ? 'bg-accent/30' : 'hover:bg-accent/20')}
                                >
                                    <td className="sticky left-0 z-10 border-r border-border bg-card px-3 py-2.5 text-sm font-medium leading-relaxed text-foreground">
                                        {sport.sport_name_kh}
                                    </td>
                                    <td className="border-l border-border px-3 py-2.5 text-right">
                                        <CountCell
                                            value={sport.athlete_male_count}
                                            onChange={(val) => updateSport(index, 'athlete_male_count', val)}
                                        />
                                    </td>
                                    <td className="px-3 py-2.5 text-right">
                                        <CountCell
                                            value={sport.athlete_female_count}
                                            onChange={(val) => updateSport(index, 'athlete_female_count', val)}
                                        />
                                    </td>
                                    <td className="border-l border-border px-3 py-2.5 text-right">
                                        <CountCell
                                            value={sport.leader_male_count}
                                            onChange={(val) => updateSport(index, 'leader_male_count', val)}
                                        />
                                    </td>
                                    <td className="px-3 py-2.5 text-right">
                                        <CountCell
                                            value={sport.leader_female_count}
                                            onChange={(val) => updateSport(index, 'leader_female_count', val)}
                                        />
                                    </td>
                                    <td className="border-l border-border bg-muted/50 px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground">
                                        {subtotal}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-border bg-muted text-sm font-semibold tabular-nums text-foreground">
                            <td className="sticky left-0 z-10 border-r border-border bg-muted px-3 py-3">{t('table.totals')}</td>
                            <td className="border-l border-border px-3 py-3 text-right">{totalAthleteM}</td>
                            <td className="px-3 py-3 text-right">{totalAthleteF}</td>
                            <td className="border-l border-border px-3 py-3 text-right">{totalLeaderM}</td>
                            <td className="px-3 py-3 text-right">{totalLeaderF}</td>
                            <td className="border-l border-border bg-accent/60 px-3 py-3 text-right text-primary">{grandTotal}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {form.formState.errors.sports && (
                <p className="text-sm leading-relaxed text-destructive">
                    {form.formState.errors.sports.message}
                </p>
            )}
        </div>
    );
}

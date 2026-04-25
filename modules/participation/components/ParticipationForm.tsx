'use client';

import { useForm } from 'react-hook-form';
import { useParticipationMutation } from '../hooks';
import { ParticipationPerSportPayload } from '../types';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

interface ParticipationFormProps { onSuccess?: () => void; }

export function ParticipationForm({ onSuccess }: ParticipationFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ParticipationPerSportPayload>();
    const { create, isCreating } = useParticipationMutation();
    const t = useTranslations('participation');
    const tCommon = useTranslations('common');

    const onSubmit = (data: ParticipationPerSportPayload) => {
        create(data, { onSuccess: () => { reset(); onSuccess?.(); } });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold text-foreground">{t('addParticipation')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t('fields.enrollId')}</label>
                    <input type="number" {...register('enroll_id', { required: t('fields.required'), valueAsNumber: true })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    {errors.enroll_id && <p className="text-[10px] text-error">{errors.enroll_id.message}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t('fields.eventId')}</label>
                    <input type="number" {...register('event_id', { required: t('fields.required'), valueAsNumber: true })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    {errors.event_id && <p className="text-[10px] text-error">{errors.event_id.message}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t('fields.sportId')}</label>
                    <input type="number" {...register('sport_id', { required: t('fields.required'), valueAsNumber: true })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    {errors.sport_id && <p className="text-[10px] text-error">{errors.sport_id.message}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t('fields.categoryId')}</label>
                    <input type="number" {...register('category_id', { valueAsNumber: true })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                </div>
            </div>
            <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? tCommon('saving') : t('saveParticipation')}
            </Button>
        </form>
    );
}

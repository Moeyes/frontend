'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sport, SportCreate } from '../types';
import { useCreateSport, useUpdateSport } from '../hooks';
import { Button } from '@/shared/ui/button';
import { TextInputField } from '@/shared/form';
import { useTranslations } from 'next-intl';

// Only the fields the backend actually persists (sports table = name_kh + sport_type).
const sportSchema = z.object({
    name_kh: z.string().min(2),
    sport_type: z.string().optional().or(z.literal('')),
});

type SportFormValues = z.infer<typeof sportSchema>;

interface SportFormProps { sport?: Sport; onSuccess: () => void; onCancel: () => void; }

export function SportForm({ sport, onSuccess, onCancel }: SportFormProps) {
    const isEditing = !!sport;
    const { mutate: create, isPending: isCreating } = useCreateSport();
    const { mutate: update, isPending: isUpdating } = useUpdateSport();
    const t = useTranslations('sports');
    const tCommon = useTranslations('common');

    const { control, handleSubmit, formState: { errors } } = useForm<SportFormValues>({
        resolver: zodResolver(sportSchema),
        defaultValues: sport ? { name_kh: sport.name_kh, sport_type: sport.sport_type || '' }
            : { name_kh: '', sport_type: '' }
    });

    const onSubmit = (data: SportFormValues) => {
        if (isEditing) update({ id: sport.id, ...data }, { onSuccess });
        else create(data as SportCreate, { onSuccess });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInputField control={control} name="name_kh" label={t('sportNameKhmer')} required error={errors.name_kh?.message} />
            <TextInputField control={control} name="sport_type" label={t('sportTypeOptional')} error={errors.sport_type?.message} />
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? tCommon('saving') : isEditing ? t('editSport') : t('createSport')}
                </Button>
            </div>
        </form>
    );
}

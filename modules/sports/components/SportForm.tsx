'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sport, SportCreate } from '../types';
import { useCreateSport, useUpdateSport } from '../hooks';
import { Button } from '@/shared/ui/button';
import { TextInputField } from '@/shared/form';

const sportSchema = z.object({
  name_kh: z.string().min(2, 'Name in Khmer is required'),
  name_en: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  sport_type: z.string().optional().or(z.literal('')),
});

type SportFormValues = z.infer<typeof sportSchema>;

interface SportFormProps {
  sport?: Sport;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SportForm({ sport, onSuccess, onCancel }: SportFormProps) {
    const isEditing = !!sport;
    const { mutate: create, isPending: isCreating } = useCreateSport();
    const { mutate: update, isPending: isUpdating } = useUpdateSport();

    const { control, handleSubmit, formState: { errors } } = useForm<SportFormValues>({
        resolver: zodResolver(sportSchema),
        defaultValues: sport ? {
            name_kh: sport.name_kh,
            name_en: sport.name_en || '',
            description: sport.description || '',
            sport_type: sport.sport_type || '',
        } : {
            name_kh: '',
            name_en: '',
            description: '',
            sport_type: '',
        }
    });

    const onSubmit = (data: SportFormValues) => {
        if (isEditing) {
            update({
                id: sport.id,
                ...data,
            }, {
                onSuccess: () => onSuccess(),
            });
        } else {
            create(data as SportCreate, {
                onSuccess: () => onSuccess(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInputField
                control={control}
                name="name_kh"
                label="Sport Name (Khmer)"
                required
                error={errors.name_kh?.message}
            />
            
            <TextInputField
                control={control}
                name="name_en"
                label="Sport Name (English)"
                error={errors.name_en?.message}
            />

            <TextInputField
                control={control}
                name="sport_type"
                label="Sport Type (Optional)"
                error={errors.sport_type?.message}
            />

            <TextInputField
                control={control}
                name="description"
                label="Description"
                error={errors.description?.message}
            />

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? 'Saving...' : isEditing ? 'Update Sport' : 'Create Sport'}
                </Button>
            </div>
        </form>
    );
}

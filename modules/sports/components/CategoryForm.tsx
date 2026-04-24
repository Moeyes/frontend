'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category, Gender, AddCategoryBody } from '../types';
import { useAddCategory, useUpdateCategory } from '../hooks';
import { Button } from '@/shared/ui/button';
import { TextInputField, SelectField } from '@/shared/form';

const categorySchema = z.object({
  category: z.string().min(2, 'Category name is required'),
  gender: z.nativeEnum(Gender).nullable().optional(),
  age_min: z.any().optional(),
  age_max: z.any().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  sportId: number;
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ sportId, category, onSuccess, onCancel }: CategoryFormProps) {
    const isEditing = !!category;
    const { mutate: add, isPending: adding } = useAddCategory();
    const { mutate: update, isPending: updating } = useUpdateCategory();

    const { control, handleSubmit, formState: { errors } } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: category ? {
            category: category.category,
            gender: category.gender || null,
            age_min: category.age_min?.toString() || '',
            age_max: category.age_max?.toString() || '',
        } : {
            category: '',
            gender: null,
            age_min: '',
            age_max: '',
        }
    });

    const onSubmit = (data: CategoryFormValues) => {
        const payload = {
            ...data,
            sport_id: sportId,
            age_min: data.age_min ? Number(data.age_min) : null,
            age_max: data.age_max ? Number(data.age_max) : null,
            gender: data.gender || null,
        };

        if (isEditing) {
            update({
                id: category.id,
                ...payload,
            }, {
                onSuccess: () => onSuccess(),
            });
        } else {
            add(payload as AddCategoryBody, {
                onSuccess: () => onSuccess(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInputField
                control={control}
                name="category"
                label="Category Name"
                required
                error={errors.category?.message}
            />
            
            <SelectField
                control={control}
                name="gender"
                label="Gender"
                options={[
                    { value: '', label: 'None / Mixed' },
                    { value: Gender.MALE, label: 'Male' },
                    { value: Gender.FEMALE, label: 'Female' },
                    { value: Gender.OTHER, label: 'Other' },
                ]}
                error={errors.gender?.message}
            />

            <div className="grid grid-cols-2 gap-4">
                <TextInputField
                    control={control}
                    name="age_min"
                    label="Min Age (Optional)"
                    type="number"
                    error={errors.age_min?.message as string}
                />
                <TextInputField
                    control={control}
                    name="age_max"
                    label="Max Age (Optional)"
                    type="number"
                    error={errors.age_max?.message as string}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={adding || updating}>
                    {adding || updating ? 'Saving...' : isEditing ? 'Update Category' : 'Add Category'}
                </Button>
            </div>
        </form>
    );
}

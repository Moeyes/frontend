'use client';

import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData, RegisterFormInput } from '../schema/registration.schema';
import { SelectField } from '@/shared/form';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import type { CategoryReference as Category } from '@/core/api/referenceData';

interface RegisterCategoryStepProps {
    form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
    categories: Category[];
}

export function RegisterCategoryStep({ form, categories }: RegisterCategoryStepProps) {
    const { control, formState } = form;
    const t = useTranslations('registration.fields');

    const categoryOptions = categories.map((c) => ({
        value: String(c.id),
        label: c.category,
    }));

    return (
        <div className="space-y-6">
            <div>
                <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    {t('category')} <span className="text-destructive">*</span>
                </label>
                <SelectField
                    control={control}
                    name="categoryId"
                    label=""
                    placeholder={categoryOptions.length === 0 ? t('noCategories') : t('selectCategory')}
                    options={categoryOptions}
                    required
                    error={formState.errors.categoryId?.message}
                />
            </div>
        </div>
    );
}

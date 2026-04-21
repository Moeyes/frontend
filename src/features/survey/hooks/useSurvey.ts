'use client';

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { surveySchema } from '@/lib/validators/survey.schema';
import type { SurveyFormData } from '../types';

export interface UseSurveyFormReturn {
    form: UseFormReturn<SurveyFormData>;
    onSubmit: (data: SurveyFormData) => Promise<void>;
    isPending: boolean;
    serverError: string | null;
}

export function useSurveyForm(onSuccess?: () => void): UseSurveyFormReturn {
    const form = useForm<SurveyFormData>({
        resolver: zodResolver(surveySchema),
        mode: 'onBlur',
        defaultValues: {
            eventId: null,
            organizationId: null,
            sportIds: [],
        },
    });

    const handleSubmit = async (data: SurveyFormData) => {
        try {
            const { submitSurvey } = await import('../services');

            if (!data.eventId || !data.organizationId) {
                throw new Error('Missing required fields');
            }

            await submitSurvey({
                organization_id: data.organizationId,
                event_id: data.eventId,
                sport_ids: data.sportIds,
            });

            onSuccess?.();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit survey';
            form.setError('root', { message });
        }
    };

    return {
        form,
        onSubmit: handleSubmit,
        isPending: form.formState.isSubmitting,
        serverError: form.formState.errors.root?.message || null,
    };
}

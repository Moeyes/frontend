'use client';

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { surveySchema } from '../services/schema';
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
        console.log('📝 handleSubmit called with data:', data);
        try {
            const { submitSurvey } = await import('../services');

            if (!data.eventId || !data.organizationId) {
                console.error('❌ Validation failed: Missing eventId or organizationId');
                throw new Error('Missing required fields');
            }

            console.log('🌐 Calling submitSurvey API...');
            await submitSurvey({
                organization_id: data.organizationId,
                event_id: data.eventId,
                sport_ids: data.sportIds,
            });

            console.log('✅ submitSurvey resolved successfully');
            onSuccess?.();
        } catch (error) {
            console.error('💥 handleSubmit error:', error);
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

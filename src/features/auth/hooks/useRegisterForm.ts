/**
 * useRegisterForm Hook
 * 
 * React Hook Form integration for registration form
 */

'use client';

import { useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterMutation } from './useRegisterMutation';
import { formDataToPayload, parseApiError, ApiErrorResponse } from '@/features/auth/types';
import { registerSchema, RegisterFormData } from '@/lib/validators/register.schema';

interface UseRegisterFormReturn {
    form: UseFormReturn<RegisterFormData>;
    onSubmit: (data: RegisterFormData) => Promise<void>;
    isPending: boolean;
    serverError: string | null;
}

/**
 * Hook for managing registration form with validation and submission
 */
export function useRegisterForm(
    onSuccess?: (enrollId: number) => void
): UseRegisterFormReturn {
    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema) as any,
        mode: 'onBlur',
        defaultValues: {
            eventType: null,
            khFamilyName: '',
            khGivenName: '',
            enFamilyName: '',
            enGivenName: '',
            gender: 'Male',
            dateOfBirth: '',
            nationality: 'Cambodian',
            phone: '',
            idDocumentType: 'IDCard',
            address: '',
            role: 'Athlete',
            eventId: null,
            organizationId: null,
            sportId: null,
            categoryId: null,
            leaderRole: '',
            photoPath: null,
            birthCertificatePath: null,
            nationalIdPath: null,
            passportPath: null,
            _uploadPhoto: false,
            _uploadId: false,
            _uploadBirth: false,
            _uploadPassport: false,
        },
    });

    const mutation = useRegisterMutation({
        onSuccess: (data) => {
            if (onSuccess) {
                onSuccess(data.enroll_id);
            }
        },
        onError: (error) => {
            const apiError = error as ApiErrorResponse;
            const parsed = parseApiError(apiError);

            if (typeof parsed === 'string') {
                form.setError('root' as any, { message: parsed });
            } else {
                parsed.forEach((message, field) => {
                    form.setError(field as any, { message });
                });
            }
        },
    });

    const onSubmit = useCallback(
        async (data: RegisterFormData) => {
            const payload = formDataToPayload(data as any);
            await mutation.mutateAsync(payload);
        },
        [mutation]
    );

    return {
        form,
        onSubmit,
        isPending: mutation.isPending,
        serverError: form.formState.errors.root?.message || null,
    };
}

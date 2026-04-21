'use client';

import { useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterMutation } from './useRegisterMutation';
import { formDataToPayload, parseApiError, ApiErrorResponse } from '@/features/registration/types';
import { registerSchema, RegisterFormData } from '@/lib/validators/register.schema';

interface UseRegisterFormReturn {
    form: UseFormReturn<RegisterFormData, object, RegisterFormData>; // ← any → object
    onSubmit: (data: RegisterFormData) => Promise<void>;
    isPending: boolean;
    serverError: string | null;
}

export function useRegisterForm(
    onSuccess?: (enrollId: number) => void
): UseRegisterFormReturn {
    const form = useForm<RegisterFormData, object, RegisterFormData>({ // ← third generic added
        resolver: zodResolver(registerSchema),
        mode: 'onBlur',
        defaultValues: {
            eventType: null,
            khFamilyName: '',
            khGivenName: '',
            enFamilyName: '',
            enGivenName: '',
            gender: 'MALE',
            dateOfBirth: '',
            nationality: 'Cambodian',
            phone: '',
            idDocumentType: 'OTHER',
            address: '',
            role: 'athlete',
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
                form.setError('root', { message: parsed });
            } else {
                parsed.forEach((message, field) => {
                    form.setError(field as unknown as keyof RegisterFormData, { message });
                });
            }
        },
    });

    const onSubmit = useCallback(
        async (data: RegisterFormData) => {
            const payload = formDataToPayload(data);
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
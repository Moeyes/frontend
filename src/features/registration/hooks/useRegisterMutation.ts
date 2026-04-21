/**
 * useRegisterMutation Hook
 * 
 * React Query mutation for user registration
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/features/registration/services';
import { RegisterPayload, RegisterResponse } from '@/features/registration/types';

interface UseRegisterMutationOptions {
    onSuccess?: (data: RegisterResponse) => void;
    onError?: (error: unknown) => void;
}

/**
 * Hook for registration mutation
 */
export function useRegisterMutation(options?: UseRegisterMutationOptions) {
    return useMutation({
        mutationFn: (payload: RegisterPayload) => registerUser(payload),
        onSuccess: (data) => {
            // Call custom success handler if provided
            if (options?.onSuccess) {
                options.onSuccess(data);
            }
        },
        onError: (error) => {
            // Call custom error handler if provided
            if (options?.onError) {
                options.onError(error);
            }
        },
    });
}

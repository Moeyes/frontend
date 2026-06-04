'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { registrationRepository } from '../adapters';

interface RegistrationsFilter {
    organization_id?: number;
    event_id?: number;
    sport_id?: number;
    search?: string;
    skip?: number;
    limit?: number;
}

export function useRegistrations(filter: RegistrationsFilter) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.registrations.list(filter),
        queryFn: () => registrationRepository.getAll(filter as Record<string, unknown>),
        staleTime: 0,
        gcTime:    0,
    });

    const deleteMutation = useMutation({
        mutationFn: (enrollId: number) => registrationRepository.delete(enrollId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        },
    });

    return {
        ...query,
        deleteRegistration: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
}

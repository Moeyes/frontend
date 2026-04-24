/**
 * useRegistrations Hook
 * 
 * Fetches and manages registration list
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRegistrations, deleteRegistration } from '../services';

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
        queryKey: ['registrations', filter],
        queryFn: () => getRegistrations(filter),
        staleTime: 30000,
    });

    const deleteMutation = useMutation({
        mutationFn: (enrollId: number) => deleteRegistration(enrollId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    return {
        ...query,
        deleteRegistration: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
}

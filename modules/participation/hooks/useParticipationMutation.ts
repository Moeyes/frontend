/**
 * useParticipationMutation Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { createParticipation, updateParticipation, deleteParticipation } from '../services';
import { ParticipationPerSportPayload } from '../types';

export function useParticipationMutation() {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: (payload: ParticipationPerSportPayload) => createParticipation(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.participations.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        },
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<ParticipationPerSportPayload> }) => 
            updateParticipation(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.participations.all });
        },
    });

    const remove = useMutation({
        mutationFn: (id: number) => deleteParticipation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.participations.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        },
    });

    return {
        create: create.mutate,
        isCreating: create.isPending,
        update: update.mutate,
        isUpdating: update.isPending,
        remove: remove.mutate,
        isRemoving: remove.isPending,
    };
}

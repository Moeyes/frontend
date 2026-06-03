/**
 * useParticipationReview Hook
 *
 * Admin review FSM transitions (approve / reject / flag / request_revision / submit).
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { reviewParticipation } from '../services';
import type { ParticipationReviewPayload } from '../types';

export function useParticipationReview() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: ParticipationReviewPayload }) =>
            reviewParticipation(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.participations.all });
        },
    });

    return {
        review: mutation.mutate,
        isReviewing: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}

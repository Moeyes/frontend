/**
 * useParticipations Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getParticipations } from '../services';

interface ParticipationsFilter {
    organization_id?: number;
    event_id?: number;
    sport_id?: number;
    skip?: number;
    limit?: number;
}

export function useParticipations(filter: ParticipationsFilter) {
    return useQuery({
        queryKey: ['participations', filter],
        queryFn: () => getParticipations(filter),
        staleTime: 30000,
    });
}

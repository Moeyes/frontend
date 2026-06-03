import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getSportParticipants } from '../services';
import { ParticipantRole } from '../types';

/**
 * Fetch participants of one role (athlete | leader) for a sport.
 * The category/age/event/org filtering happens client-side in the panel,
 * since the dataset per sport is small and the backend doesn't filter by
 * category or age.
 */
export function useSportParticipants(
    sportId: number,
    role: ParticipantRole,
    enabled = true,
) {
    return useQuery({
        queryKey: queryKeys.sports.participants(sportId, role),
        queryFn: () => getSportParticipants({ role, sportId }),
        enabled: enabled && !!sportId,
        staleTime: 30_000,
    });
}

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { listEventSportOrgs } from '../services';

export function useEventSportOrgs(eventId: number, sportId: number | null) {
    return useQuery({
        queryKey: queryKeys.events.sportOrgs(eventId, sportId),
        queryFn: () => listEventSportOrgs(eventId, sportId!),
        enabled: !!eventId && !!sportId,
    });
}

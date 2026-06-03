import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { listEventSports } from '../services';

export function useEventSports(eventId: number) {
    return useQuery({
        queryKey: queryKeys.events.sports(eventId),
        queryFn: () => listEventSports(eventId),
        enabled: !!eventId,
    });
}

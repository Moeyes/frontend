import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getEventById } from '../services';

export function useEventDetail(eventId: number) {
    return useQuery({
        queryKey: queryKeys.events.detail(eventId),
        queryFn: () => getEventById(eventId),
        enabled: !!eventId,
    });
}

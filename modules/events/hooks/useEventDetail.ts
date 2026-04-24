import { useQuery } from '@tanstack/react-query';
import { getEventById } from '../services';

export function useEventDetail(eventId: number) {
    return useQuery({
        queryKey: ['events', eventId],
        queryFn: () => getEventById(eventId),
        enabled: !!eventId,
    });
}

import { useQuery } from '@tanstack/react-query';
import { listEventSports } from '../services';

export function useEventSports(eventId: number) {
    return useQuery({
        queryKey: ['events', eventId, 'sports'],
        queryFn: () => listEventSports(eventId),
        enabled: !!eventId,
    });
}

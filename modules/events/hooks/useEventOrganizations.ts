import { useQuery } from '@tanstack/react-query';
import { listUniqueOrgsInEvent } from '../services';

export function useEventOrganizations(eventId: number) {
    return useQuery({
        queryKey: ['events', eventId, 'organizations'],
        queryFn: () => listUniqueOrgsInEvent(eventId),
        enabled: !!eventId,
    });
}

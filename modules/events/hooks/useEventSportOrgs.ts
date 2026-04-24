import { useQuery } from '@tanstack/react-query';
import { listEventSportOrgs } from '../services';

export function useEventSportOrgs(eventId: number, sportId: number | null) {
    return useQuery({
        queryKey: ['events', eventId, 'sports', sportId, 'orgs'],
        queryFn: () => listEventSportOrgs(eventId, sportId!),
        enabled: !!eventId && !!sportId,
    });
}

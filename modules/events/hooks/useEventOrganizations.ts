import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { listUniqueOrgsInEvent } from '../services';

export function useEventOrganizations(eventId: number) {
    return useQuery({
        queryKey: queryKeys.events.organizations(eventId),
        queryFn: () => listUniqueOrgsInEvent(eventId),
        enabled: !!eventId,
    });
}

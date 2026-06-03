import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import eventsService from '../services';

export function useEvents() {
    return useQuery({
        queryKey: queryKeys.events.all,
        // queryFn: getEvents,
        queryFn: async () => {
            const data = await eventsService.getEvents();
            console.log('RAW EVENTS DATA:', data); // Debug log
            return data;
        }
    });
}

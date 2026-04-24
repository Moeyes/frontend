import { useQuery } from '@tanstack/react-query';
import eventsService from '../services';

export function useEvents() {
    return useQuery({
        queryKey: ['events'],
        // queryFn: getEvents,
        queryFn: async () => {
            const data = await eventsService.getEvents();
            console.log('RAW EVENTS DATA:', data); // Debug log
            return data;
        }
    });
}

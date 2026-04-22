import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeSportFromEvent } from '../services';

export function useRemoveSportFromEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, sportId }: { eventId: number; sportId: number }) => 
            removeSportFromEvent(eventId, sportId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'sports'] });
        },
    });
}

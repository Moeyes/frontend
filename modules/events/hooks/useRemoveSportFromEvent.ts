import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeSportFromEvent } from '../services';

export function useRemoveSportFromEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, associationId }: { eventId: number; associationId: number }) =>
            removeSportFromEvent(associationId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'sports'] });
        },
    });
}

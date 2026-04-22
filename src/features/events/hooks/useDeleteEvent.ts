import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEvent } from '../services';

export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: number) => deleteEvent(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
}

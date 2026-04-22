import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent } from '../services';
import { EventCreate } from '../types';

export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventData: EventCreate) => createEvent(eventData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
}

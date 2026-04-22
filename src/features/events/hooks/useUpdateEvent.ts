import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEvent } from '../services';
import { EventUpdate } from '../types';

export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventData: EventUpdate) => updateEvent(eventData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
}

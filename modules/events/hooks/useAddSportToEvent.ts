import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSportToEvent } from '../services';
import { AddSportToEventPayload } from '../types';

export function useAddSportToEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddSportToEventPayload) => addSportToEvent(payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['events', variables.event_id, 'sports'] });
        },
    });
}

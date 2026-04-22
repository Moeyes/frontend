import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addOrgToEventSport } from '../services';
import { AddOrgToEventSportPayload } from '../types';

export function useAddOrgToEventSport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddOrgToEventSportPayload) => addOrgToEventSport(payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ['events', variables.event_id, 'sports', variables.sport_id, 'orgs'] 
            });
        },
    });
}

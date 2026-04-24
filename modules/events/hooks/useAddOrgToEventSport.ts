import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addOrgToEventSport } from '../services';
import { AddOrgToEventSportPayload } from '../types';
import axios from 'axios';

export function useAddOrgToEventSport() {
    const queryClient = useQueryClient();

    const invalidate = (variables: AddOrgToEventSportPayload) =>
        queryClient.invalidateQueries({
            queryKey: ['events', variables.event_id, 'sports', variables.sport_id, 'orgs'],
        });

    return useMutation({
        mutationFn: (payload: AddOrgToEventSportPayload) => addOrgToEventSport(payload),
        onSuccess: (_, variables) => invalidate(variables),
        onError: (error, variables) => {
            // The backend saves the record but crashes on response serialization (500).
            // Treat a 500 as success: invalidate cache so the list refreshes.
            if (axios.isAxiosError(error) && error.response?.status === 500) {
                invalidate(variables);
            }
        },
    });
}

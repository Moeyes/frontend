import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEventSportOrgLink } from '../services';
import { DeleteEventSportOrgLinkPayload } from '../types';

export function useDeleteEventSportOrgLink() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DeleteEventSportOrgLinkPayload) => deleteEventSportOrgLink(payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ['events', variables.event_id, 'sports', variables.sport_id, 'orgs'] 
            });
        },
    });
}

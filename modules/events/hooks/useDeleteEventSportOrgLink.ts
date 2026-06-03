import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { deleteEventSportOrgLink } from '../services';
import { DeleteEventSportOrgLinkPayload } from '../types';

export function useDeleteEventSportOrgLink() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('deleted') },
        mutationFn: (payload: DeleteEventSportOrgLinkPayload) => deleteEventSportOrgLink(payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.events.sportOrgs(variables.event_id, variables.sport_id) 
            });
        },
    });
}

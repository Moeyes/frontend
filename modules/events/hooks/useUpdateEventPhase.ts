import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { updateEventPhase } from '../services';
import { PhaseUpdatePayload } from '../types';

/**
 * Force a single event lifecycle phase OPEN / CLOSED / AUTO via the dedicated
 * PATCH /events/{id}/phase endpoint (admin / super_admin only — the backend
 * returns 403 otherwise, surfaced by the global mutation error toast).
 */
export function useUpdateEventPhase() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('updated') },
        mutationFn: (payload: PhaseUpdatePayload) => updateEventPhase(payload),
        onSuccess: () => {
            // Partial key match invalidates both the list (queryKeys.events.all) and any
            // detail query (['events', id]).
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
        },
    });
}

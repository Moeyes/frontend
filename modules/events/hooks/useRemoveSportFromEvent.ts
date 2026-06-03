import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { removeSportFromEvent } from '../services';

export function useRemoveSportFromEvent() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('deleted') },
        mutationFn: ({ eventId, associationId }: { eventId: number; associationId: number }) =>
            removeSportFromEvent(associationId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.sports(variables.eventId) });
        },
    });
}

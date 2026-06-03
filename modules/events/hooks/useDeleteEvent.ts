import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { deleteEvent } from '../services';

export function useDeleteEvent() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('deleted') },
        mutationFn: (eventId: number) => deleteEvent(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
        },
    });
}

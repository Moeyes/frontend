import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { createEvent } from '../services';
import { EventCreate } from '../types';

export function useCreateEvent() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('created') },
        mutationFn: (eventData: EventCreate) => createEvent(eventData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
        },
    });
}

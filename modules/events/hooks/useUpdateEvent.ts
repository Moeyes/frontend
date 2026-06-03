import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { updateEvent } from '../services';
import { EventUpdate } from '../types';

export function useUpdateEvent() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('updated') },
        mutationFn: (eventData: EventUpdate) => updateEvent(eventData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
        },
    });
}

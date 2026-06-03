import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { addSportToEvent } from '../services';
import { AddSportToEventPayload } from '../types';

export function useAddSportToEvent() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('created') },
        mutationFn: (payload: AddSportToEventPayload) => addSportToEvent(payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.sports(variables.event_id) });
        },
    });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { addOrgToEventSport } from '../services';
import { AddOrgToEventSportPayload } from '../types';
import axios from 'axios';

export function useAddOrgToEventSport() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    const invalidate = (variables: AddOrgToEventSportPayload) =>
        queryClient.invalidateQueries({
            queryKey: queryKeys.events.sportOrgs(variables.event_id, variables.sport_id),
        });

    return useMutation({
        // This hook special-cases a backend 500 as success, so opt out of the
        // global error toast and manage feedback locally.
        meta: { successMessage: t('created'), suppressErrorToast: true },
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

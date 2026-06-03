import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { createSport } from '../services';
import { SportCreate } from '../types';

export function useCreateSport() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('created') },
        mutationFn: (sportData: SportCreate) => createSport(sportData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
        },
    });
}

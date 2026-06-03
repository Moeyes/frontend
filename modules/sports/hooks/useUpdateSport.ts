import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { updateSport } from '../services';
import { SportUpdate } from '../types';

export function useUpdateSport() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('updated') },
        mutationFn: (sportData: SportUpdate) => updateSport(sportData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
        },
    });
}

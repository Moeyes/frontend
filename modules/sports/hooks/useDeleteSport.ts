import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { deleteSport } from '../services';

export function useDeleteSport() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('deleted') },
        mutationFn: (sportId: number) => deleteSport(sportId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
        },
    });
}

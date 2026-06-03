import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { deleteCategory } from '../services';
import { DeleteCategoryBody } from '../types';

export function useDeleteCategory(sportId: number) {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('deleted') },
        mutationFn: (payload: DeleteCategoryBody) => deleteCategory(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.bySport(sportId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
        },
    });
}

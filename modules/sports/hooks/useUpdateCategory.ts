import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { updateCategory } from '../services';
import { UpdateCategoryBody } from '../types';

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('updated') },
        mutationFn: (categoryData: UpdateCategoryBody) => updateCategory(categoryData),
        onSuccess: (_, variables) => {
            if (variables.sport_id) {
                queryClient.invalidateQueries({ queryKey: queryKeys.categories.bySport(variables.sport_id) });
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
        },
    });
}

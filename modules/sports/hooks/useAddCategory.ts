import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { addCategory } from '../services';
import { AddCategoryBody } from '../types';

export function useAddCategory() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('created') },
        mutationFn: (categoryData: AddCategoryBody) => addCategory(categoryData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.bySport(variables.sport_id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
        },
    });
}

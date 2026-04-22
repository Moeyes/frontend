import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCategory } from '../services';
import { UpdateCategoryBody } from '../types';

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryData: UpdateCategoryBody) => updateCategory(categoryData),
        onSuccess: (_, variables) => {
            if (variables.sport_id) {
                queryClient.invalidateQueries({ queryKey: ['categories', variables.sport_id] });
            }
            queryClient.invalidateQueries({ queryKey: ['sports'] });
        },
    });
}

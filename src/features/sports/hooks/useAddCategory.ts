import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCategory } from '../services';
import { AddCategoryBody } from '../types';

export function useAddCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryData: AddCategoryBody) => addCategory(categoryData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['categories', variables.sport_id] });
            queryClient.invalidateQueries({ queryKey: ['sports'] });
        },
    });
}

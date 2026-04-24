import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../services';
import { DeleteCategoryBody } from '../types';

export function useDeleteCategory(sportId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DeleteCategoryBody) => deleteCategory(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', sportId] });
            queryClient.invalidateQueries({ queryKey: ['sports'] });
        },
    });
}

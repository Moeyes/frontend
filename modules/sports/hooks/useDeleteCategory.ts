import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useDeleteCategory(eventId: number, sportId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: number) => deleteCategory(categoryId),
    onSettled:  () =>
      qc.invalidateQueries({ queryKey: sportKeys.categories(eventId, sportId) }),
  });
}

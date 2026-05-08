import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCategory, type UpdateCategoryBody } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useUpdateCategory(eventId: number, sportId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCategoryBody) => updateCategory(body),
    onSettled:  () =>
      qc.invalidateQueries({ queryKey: sportKeys.categories(eventId, sportId) }),
  });
}

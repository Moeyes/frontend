import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCategory, type AddCategoryBody } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useAddCategory(eventId: number, sportId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddCategoryBody) => addCategory(body),
    onSettled:  () =>
      qc.invalidateQueries({ queryKey: sportKeys.categories(eventId, sportId) }),
  });
}

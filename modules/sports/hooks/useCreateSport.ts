import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSport, type SportCreate } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useCreateSport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SportCreate) => createSport(body),
    onSettled:  () => qc.invalidateQueries({ queryKey: sportKeys.lists() }),
  });
}

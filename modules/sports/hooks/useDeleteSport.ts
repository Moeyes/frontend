import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSport } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useDeleteSport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sportId: number) => deleteSport(sportId),
    onSettled: () => qc.invalidateQueries({ queryKey: sportKeys.lists() }),
  });
}

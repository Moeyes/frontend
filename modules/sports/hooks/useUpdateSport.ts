import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSport, type SportUpdate } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useUpdateSport(sportId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SportUpdate) => updateSport(sportId, body),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: sportKeys.detail(sportId) });
      qc.invalidateQueries({ queryKey: sportKeys.lists() });
    },
  });
}

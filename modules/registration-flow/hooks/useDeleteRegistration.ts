import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRegistration } from '../services/registration.service';
import { regKeys } from '../services/keys';

export function useDeleteRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollId: number) => deleteRegistration(enrollId),
    onSettled:  () => qc.invalidateQueries({ queryKey: regKeys.lists() }),
  });
}

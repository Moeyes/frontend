import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDeleteRegistration } from '@/modules/registration-flow';
import { participationKeys } from '../services/keys';

export function useDeleteOrganizer() {
  const qc = useQueryClient();
  const inner = useDeleteRegistration();

  return useMutation({
    mutationFn: (enrollId: number) => inner.mutateAsync(enrollId),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: participationKeys.lists() }),
  });
}

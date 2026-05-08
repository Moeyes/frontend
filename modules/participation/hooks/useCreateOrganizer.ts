import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useCreateRegistration } from '@/modules/registration-flow';
import { participationKeys } from '../services/keys';

export function useCreateOrganizer() {
  const qc = useQueryClient();
  const inner = useCreateRegistration();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      inner.mutateAsync({ ...body, role: 'leader' }),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: participationKeys.lists() }),
  });
}

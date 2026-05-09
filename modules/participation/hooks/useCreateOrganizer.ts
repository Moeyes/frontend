import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createRegistration, type ParticipantCreateBody } from '@/modules/registration-flow/services/registration.service';
import { participationKeys } from '../services/keys';

export function useCreateOrganizer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ParticipantCreateBody) => createRegistration(body),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: participationKeys.lists() }),
  });
}

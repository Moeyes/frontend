import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRegistration, type ParticipantCreateBody } from '../services/registration.service';
import { regKeys } from '../services/keys';

export function useCreateRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ParticipantCreateBody) => createRegistration(body),
    onSettled:  () => qc.invalidateQueries({ queryKey: regKeys.lists() }),
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeOrgFromEventSport } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useRemoveOrgFromEventSport(eventId: number, sportId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (associationId: number) => removeOrgFromEventSport(associationId),
    onSettled:  () =>
      qc.invalidateQueries({ queryKey: eventKeys.sportOrgs(eventId, sportId) }),
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeSportFromEvent } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useRemoveSportFromEvent(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (associationId: number) => removeSportFromEvent(associationId),
    onSettled:  () => qc.invalidateQueries({ queryKey: eventKeys.sports(eventId) }),
  });
}

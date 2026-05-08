import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSportToEvent } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useAddSportToEvent(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sportId: number) =>
      addSportToEvent({ events_id: eventId, sports_id: sportId }),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: eventKeys.sports(eventId) }),
  });
}

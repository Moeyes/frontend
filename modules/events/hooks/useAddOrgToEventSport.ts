import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addOrgToEventSport, type EventSportOrgLink } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useAddOrgToEventSport(eventId: number, sportId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EventSportOrgLink) => addOrgToEventSport(body),
    onSettled:  () =>
      qc.invalidateQueries({ queryKey: eventKeys.sportOrgs(eventId, sportId) }),
  });
}

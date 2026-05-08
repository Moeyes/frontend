import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEvent, type EventUpdate } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useUpdateEvent(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EventUpdate) => updateEvent(eventId, body),
    onSuccess:  (updated) => qc.setQueryData(eventKeys.detail(eventId), updated),
    onSettled:  () => qc.invalidateQueries({ queryKey: eventKeys.lists() }),
  });
}

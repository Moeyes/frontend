import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent, type EventCreate } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EventCreate) => createEvent(body),
    onSettled:  () => qc.invalidateQueries({ queryKey: eventKeys.lists() }),
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEvent } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => deleteEvent(eventId),
    onSettled:  () => qc.invalidateQueries({ queryKey: eventKeys.lists() }),
  });
}

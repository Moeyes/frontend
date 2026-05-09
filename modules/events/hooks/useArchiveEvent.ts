import { useMutation, useQueryClient } from '@tanstack/react-query';
import { archiveEvent } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useArchiveEvent(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => archiveEvent(eventId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

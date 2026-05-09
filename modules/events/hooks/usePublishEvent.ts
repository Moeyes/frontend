import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishEvent } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function usePublishEvent(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => publishEvent(eventId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

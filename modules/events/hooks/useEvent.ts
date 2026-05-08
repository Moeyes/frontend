import { useQuery } from '@tanstack/react-query';
import { getEvent } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useEvent(eventId: number) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn:  () => getEvent(eventId),
    enabled:  !!eventId,
  });
}

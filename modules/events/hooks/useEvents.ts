import { useQuery } from '@tanstack/react-query';
import { listEvents, type ListEventsParams } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useEvents(params?: ListEventsParams) {
  return useQuery({
    queryKey: eventKeys.list(params ?? {}),
    queryFn:  () => listEvents(params),
  });
}

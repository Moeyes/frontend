import { useQuery } from '@tanstack/react-query';
import { listEventSports, listAllSports } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useEventSports(eventId: number) {
  return useQuery({
    queryKey: eventKeys.sports(eventId),
    queryFn:  () => listEventSports(eventId),
    enabled:  !!eventId,
  });
}

// Fetches the full sports catalogue — used to resolve sports_id for linking orgs.
// sport_name in SportsEventPublic should match name_kh in SportPublic.
export function useAllSportsCatalogue() {
  return useQuery({
    queryKey: ['sports', 'catalogue'],
    queryFn:  listAllSports,
    staleTime: 5 * 60_000,
  });
}

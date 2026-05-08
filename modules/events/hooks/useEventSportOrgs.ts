import { useQuery } from '@tanstack/react-query';
import { listSportOrgs, listAllOrgs } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useEventSportOrgs(eventId: number, sportId: number) {
  return useQuery({
    queryKey: eventKeys.sportOrgs(eventId, sportId),
    queryFn:  () => listSportOrgs(eventId, sportId),
    enabled:  !!eventId && !!sportId,
  });
}

export function useAllOrgsCatalogue() {
  return useQuery({
    queryKey: ['orgs', 'catalogue'],
    queryFn:  listAllOrgs,
    staleTime: 5 * 60_000,
  });
}

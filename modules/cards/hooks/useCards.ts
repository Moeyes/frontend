import { useQuery } from '@tanstack/react-query';
import { listCards } from '../services/cards.service';
import { cardKeys } from '../services/keys';

export function useCards(orgId: number | null, eventId: number | null) {
  return useQuery({
    queryKey: orgId && eventId ? cardKeys.list(orgId, eventId) : ['cards', 'disabled'],
    queryFn:  () => listCards(orgId!, eventId!),
    enabled:  !!orgId && !!eventId,
  });
}

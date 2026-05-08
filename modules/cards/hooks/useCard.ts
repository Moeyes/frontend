import { useQuery } from '@tanstack/react-query';
import { getCard } from '../services/cards.service';
import { cardKeys } from '../services/keys';

export function useCard(pId: string | null, orgId: number | null, eventId: number | null) {
  return useQuery({
    queryKey: pId && orgId && eventId
      ? cardKeys.detail(pId, orgId, eventId)
      : ['cards', 'detail', 'disabled'],
    queryFn:  () => getCard(pId!, orgId!, eventId!),
    enabled:  !!pId && !!orgId && !!eventId,
  });
}

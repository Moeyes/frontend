'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getCard } from '../services';

export function useCard(pId: string, orgId: string, eventId: string) {
  const { data: card, isLoading, error } = useQuery({
    queryKey: queryKeys.cards.one(pId, orgId, eventId),
    queryFn: () => getCard(pId, orgId, eventId),
    enabled: !!(pId && orgId && eventId),
  });

  return { card, isLoading, error };
}

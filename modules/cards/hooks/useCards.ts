'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getCards } from '../services';

export function useCards(orgId: string, eventId: string, page = 1) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.cards.list(orgId, eventId, page),
    queryFn: () => getCards(orgId, eventId, page),
    enabled: !!(orgId && eventId),
    placeholderData: (previousData) => previousData,
  });

  return { 
    cards: data?.items || [], 
    total: data?.total || 0, 
    isLoading, 
    error 
  };
}

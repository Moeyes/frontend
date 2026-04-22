/**
 * Card Service
 */

import apiClient from '@/lib/api/client';
import { CardData, PaginatedCardsResponse } from '../types';

/**
 * Get a single card
 * GET /api/card/{pId}/{orgId}/{eventId}
 */
export async function getCard(pId: string, orgId: string, eventId: string): Promise<CardData> {
  const response = await apiClient.get<CardData>(`/api/card/${pId}/${orgId}/${eventId}`);
  return response.data;
}

/**
 * List paginated cards
 * GET /api/cards/{orgId}/{eventId}?page={page}&page_size={pageSize}
 */
export async function getCards(
  orgId: string,
  eventId: string,
  page = 1,
  pageSize = 12
): Promise<PaginatedCardsResponse> {
  const response = await apiClient.get<PaginatedCardsResponse>(
    `/api/cards/${orgId}/${eventId}`,
    {
      params: {
        page,
        page_size: pageSize,
      },
    }
  );
  return response.data;
}

import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type CardResponse           = components['schemas']['CardResponse'];
export type PaginatedCardsResponse = components['schemas']['PaginatedCardsResponse'];

export async function listCards(
  orgId: number,
  eventId: number
): Promise<PaginatedCardsResponse> {
  const { data, error } = await api.GET('/api/cards/{org_id}/{event_id}', {
    params: { path: { org_id: orgId, event_id: eventId } },
  });
  if (error) throw error;
  return data!;
}

export async function getCard(
  pId: string,
  orgId: number,
  eventId: number
): Promise<CardResponse> {
  const { data, error } = await api.GET('/api/card/{p_id}/{org_id}/{event_id}', {
    params: { path: { p_id: pId, org_id: orgId, event_id: eventId } },
  });
  if (error) throw error;
  return data!;
}

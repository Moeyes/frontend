import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type EventPublic        = components['schemas']['EventPublic'];
export type EventCreate        = components['schemas']['EventCreate'];
export type EventUpdate        = components['schemas']['EventUpdate'];
export type EventsPublic       = components['schemas']['EventsPublic'];
export type EventType          = components['schemas']['eventType'];
export type SportsEventPublic  = components['schemas']['SportsEventPublic'];
export type SportsEventCreate  = components['schemas']['SportsEventCreate'];
export type SportsEventOrgPublic = components['schemas']['SportsEventOrgPublic'];
export type EventSportOrgLink  = components['schemas']['EventSportOrgLink'];
export type SportEventOrgOnly  = components['schemas']['SportEventOrgOnly'];
export type OrganizationPublic = components['schemas']['OrganizationPublic'];
export type SportPublic        = components['schemas']['SportPublic'];

// Map Khmer enum values to i18n key suffixes for display
export const EVENT_TYPE_KEY: Record<EventType, string> = {
  'កីឡាជាតិ':                                                                    'national',
  'កីឡាឧត្តមសិក្សា និងមធ្យមសិក្សា​បចេ្ចកទេសថ្នាក់ជាតិថ្នាក់ជាតិ':              'university',
  'សិស្សមធ្យមសិក្សា​ថ្នាក់ជាតិ':                                                 'highSchool',
  'កីឡាសិស្សបថមសិក្សាជាតិ':                                                       'primarySchool',
};

export const EVENT_TYPES = Object.keys(EVENT_TYPE_KEY) as EventType[];

export interface ListEventsParams {
  skip?: number;
  limit?: number;
}

export async function listEvents(params?: ListEventsParams): Promise<EventsPublic> {
  const { data, error } = await api.GET('/api/events/', { params: { query: params } });
  if (error) throw error;
  return data;
}

export async function getEvent(eventId: number): Promise<EventPublic> {
  const { data, error } = await api.GET('/api/events/{event_id}', {
    params: { path: { event_id: eventId } },
  });
  if (error) throw error;
  return data;
}

export async function createEvent(body: EventCreate): Promise<EventPublic> {
  const { data, error } = await api.POST('/api/events/', { body });
  if (error) throw error;
  return data;
}

export async function updateEvent(eventId: number, body: EventUpdate): Promise<EventPublic> {
  const { data, error } = await api.PATCH('/api/events/{event_id}', {
    params: { path: { event_id: eventId } },
    body,
  });
  if (error) throw error;
  return data;
}

export async function deleteEvent(eventId: number): Promise<void> {
  const { error } = await api.DELETE('/api/events/delete', {
    body: { event_id: eventId },
  });
  if (error) throw error;
}

// --- Sport attachment ---

export async function listEventSports(eventId: number): Promise<SportsEventPublic[]> {
  const { data, error } = await api.GET('/api/events/{event_id}/sports', {
    params: { path: { event_id: eventId } },
  });
  if (error) throw error;
  return data as SportsEventPublic[];
}

export async function addSportToEvent(body: SportsEventCreate): Promise<SportsEventPublic> {
  const { data, error } = await api.POST('/api/events/add-sport', { body });
  if (error) throw error;
  return data;
}

export async function removeSportFromEvent(associationId: number): Promise<void> {
  const { error } = await api.DELETE('/api/events/remove-sport-from-event', {
    body: { association_id: associationId },
  });
  if (error) throw error;
}

// --- Org↔sport linking ---

export async function listSportOrgs(eventId: number, sportId: number): Promise<SportEventOrgOnly[]> {
  const { data, error } = await api.GET('/api/events/{event_id}/sports/{sport_id}/orgs', {
    params: { path: { event_id: eventId, sport_id: sportId } },
  });
  if (error) throw error;
  return data as SportEventOrgOnly[];
}

export async function addOrgToEventSport(body: EventSportOrgLink): Promise<SportsEventOrgPublic> {
  const { data, error } = await api.POST('/api/events/add-org-to-sport', { body });
  if (error) throw error;
  return data;
}

export async function removeOrgFromEventSport(associationId: number): Promise<void> {
  const { error } = await api.DELETE('/api/events/delete-event-sport-org-link', {
    body: { association_id: associationId },
  });
  if (error) throw error;
}

// --- Pickers (used by event sport/org managers) ---

export async function listAllSports(): Promise<SportPublic[]> {
  const { data, error } = await api.GET('/api/sports/', {
    params: { query: { limit: 200 } },
  });
  if (error) throw error;
  return (data as { data: SportPublic[] }).data;
}

export async function listAllOrgs(): Promise<OrganizationPublic[]> {
  const { data, error } = await api.GET('/api/organization/', {
    params: { query: { limit: 200 } },
  });
  if (error) throw error;
  return (data as { data: OrganizationPublic[] }).data;
}

import apiClient from '@/lib/api/client';
import { PdfDataResponse, Event, Organization, Sport } from '../types';

export const getPdfData = async (
  sportId: number,
  orgId: number,
  eventId: number
): Promise<PdfDataResponse> => {
  const { data } = await apiClient.get<PdfDataResponse>(
    `/api/events/pdf/sport/${sportId}/org/${orgId}/event/${eventId}`
  );
  return data;
};

export async function fetchEvents(): Promise<Event[]> {
  const response = await apiClient.get<{ data: Event[] }>('/api/events?limit=100');
  return response.data.data || [];
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const response = await apiClient.get<{ data: Organization[] }>('/api/organization?limit=100');
  return response.data.data || [];
}

export async function fetchEventSports(eventId: number): Promise<Sport[]> {
  const [eventSportsRes, allSportsRes] = await Promise.all([
    apiClient.get<any[]>(`/api/events/${eventId}/sports`),
    apiClient.get<{ data: Sport[] }>('/api/sports?limit=200')
  ]);
  
  const eventSports = eventSportsRes.data || [];
  const allSports = allSportsRes.data.data || [];

  return eventSports.map(se => {
    // Match by name to get the actual sport_id because the backend 
    // only returns the association ID in this endpoint
    const matchedSport = allSports.find(s => s.name_kh === se.sport_name);
    return {
      id: matchedSport ? matchedSport.id : se.id, 
      name_kh: se.sport_name || ''
    };
  });
}

export async function fetchEventSportOrgs(eventId: number, sportId: number): Promise<Organization[]> {
  const response = await apiClient.get<any[]>(`/api/events/${eventId}/sports/${sportId}/orgs`);
  return response.data.map(o => ({
    id: o.organization_id || o.id,
    name_kh: o.organization_name || '',
    type: undefined
  })) || [];
}

export async function fetchAllSports(): Promise<Sport[]> {
  const response = await apiClient.get<{ data: Sport[] }>('/api/sports?limit=200');
  return response.data.data || [];
}

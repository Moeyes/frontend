import apiClient from '@/lib/api/client';
import { 
    Event, 
    EventCreate, 
    EventUpdate, 
    Sport, 
    Organization, 
    Category,
    AddSportToEventPayload,
    AddOrgToEventSportPayload,
    DeleteEventSportOrgLinkPayload,
    RemoveOrgCompletelyFromEventPayload
} from '../types';

const BASE_URL = '/api/events';

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
    const response = await apiClient.get<any>(`${BASE_URL}/`);
    // Handle both direct array and { data: [] } wrapper
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
}

/**
 * Get single event by ID
 */
export async function getEventById(eventId: number): Promise<Event> {
    const { data } = await apiClient.get<any>(`${BASE_URL}/${eventId}`);
    return data?.data || data;
}

/**
 * Create a new event
 */
export async function createEvent(eventData: EventCreate): Promise<Event> {
    const { data } = await apiClient.post<any>(`${BASE_URL}/`, eventData);
    return data?.data || data;
}

/**
 * Update an existing event
 */
export async function updateEvent(eventData: EventUpdate): Promise<Event> {
    const { id, ...payload } = eventData;
    const { data } = await apiClient.patch<any>(`${BASE_URL}/${id}`, payload);
    return data?.data || data;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/delete`, { data: { event_id: eventId } });
}

/**
 * Add a sport to an event
 */
export async function addSportToEvent(payload: AddSportToEventPayload): Promise<void> {
    await apiClient.post(`${BASE_URL}/add-sport`, payload);
}

/**
 * List sports assigned to an event
 */
export async function listEventSports(eventId: number): Promise<Sport[]> {
    const response = await apiClient.get<any>(`${BASE_URL}/${eventId}/sports`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
}

/**
 * Remove a sport from an event
 */
export async function removeSportFromEvent(eventId: number, sportId: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/remove-sport-from-event`, { 
        data: { event_id: eventId, sport_id: sportId } 
    });
}

/**
 * Add an organization to a sport in an event
 */
export async function addOrgToEventSport(payload: AddOrgToEventSportPayload): Promise<void> {
    await apiClient.post(`${BASE_URL}/add-org-to-sport`, payload);
}

/**
 * List organizations assigned to a sport in an event
 */
export async function listEventSportOrgs(eventId: number, sportId: number): Promise<Organization[]> {
    const response = await apiClient.get<any>(`${BASE_URL}/${eventId}/sports/${sportId}/orgs`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
}

/**
 * List categories for a sport in an event
 */
export async function listEventSportCategories(eventId: number, sportId: number): Promise<Category[]> {
    const response = await apiClient.get<any>(`${BASE_URL}/${eventId}/sports/${sportId}/categories`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
}

/**
 * Delete a specific event-sport-org link
 */
export async function deleteEventSportOrgLink(payload: DeleteEventSportOrgLinkPayload): Promise<void> {
    await apiClient.delete(`${BASE_URL}/delete-event-sport-org-link`, { data: payload });
}

/**
 * List unique organizations participating in an event
 */
export async function listUniqueOrgsInEvent(eventId: number): Promise<Organization[]> {
    const response = await apiClient.get<any>(`${BASE_URL}/${eventId}/organizations`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
}

/**
 * Remove an organization completely from an event
 */
export async function removeOrgCompletelyFromEvent(payload: RemoveOrgCompletelyFromEventPayload): Promise<void> {
    await apiClient.delete(`${BASE_URL}/remove-org-completely-from-event`, { data: payload });
}

export const eventsService = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    addSportToEvent,
    listEventSports,
    removeSportFromEvent,
    addOrgToEventSport,
    listEventSportOrgs,
    listEventSportCategories,
    deleteEventSportOrgLink,
    listUniqueOrgsInEvent,
    removeOrgCompletelyFromEvent,
};

export default eventsService;

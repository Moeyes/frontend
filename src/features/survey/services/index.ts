/**
 * survey Feature - Services
 * API calls and business logic for survey feature
 */

import apiClient from '@/lib/api/client';
import type { Event, Organization, Sport } from '../types';

// Backend response types
interface SportsEventResponse {
    id: number;
    sports_id?: number;
    event_name?: string;
    sport_name?: string;
    created_at?: string;
}

// Cache management
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<unknown>>();

function getCache<T>(key: string): T | null {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_DURATION) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

function setCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// API Calls
export async function fetchEvents(): Promise<Event[]> {
    try {
        const cached = getCache<Event[]>('events');
        if (cached) return cached;

        const response = await apiClient.get<{ data: Event[] }>('/api/events?skip=0&limit=100');
        const events = response.data.data || [];
        setCache('events', events);
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

export async function fetchAllOrganizations(): Promise<Organization[]> {
    try {
        const cached = getCache<Organization[]>('organizations');
        if (cached) return cached;

        const response = await apiClient.get<{ data: Organization[] }>('/api/organization?skip=0&limit=100');
        const organizations = response.data.data || [];
        setCache('organizations', organizations);
        return organizations;
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return [];
    }
}

export async function fetchEventSports(eventId: number): Promise<Sport[]> {
    try {
        const cacheKey = `event-sports-${eventId}`;
        const cached = getCache<Sport[]>(cacheKey);
        if (cached) {
            console.log('⚡ Cache HIT for event-sports-' + eventId, cached);
            return cached;
        }

        console.log('📡 Cache MISS - Fetching from backend for event ' + eventId);
        const response = await apiClient.get<SportsEventResponse[]>(`/api/events/${eventId}/sports`);
        const sportsEvents = response.data || [];

        // Map SportsEventPublic response to Sport interface
        // Use sports_id (the actual sport ID) not id (which is the sports_event link ID)
        const sports: Sport[] = sportsEvents.map((se) => ({
            id: se.sports_id || se.id, // Use sports_id if available, fallback to id
            name_kh: se.sport_name || '',
            sport_type: undefined,
            created_at: se.created_at,
        }));

        console.log('📍 fetchEventSports - Raw response:', sportsEvents);
        console.log('📍 fetchEventSports - Mapped sports:', sports);

        setCache(cacheKey, sports);
        return sports;
    } catch (error) {
        console.error('Error fetching event sports:', error);
        return [];
    }
}

// Fetch all data needed for survey form
export async function fetchSurveyData() {
    try {
        const [events, organizations] = await Promise.all([
            fetchEvents(),
            fetchAllOrganizations(),
        ]);

        return { events, organizations };
    } catch (error) {
        console.error('Error fetching survey data:', error);
        return { events: [], organizations: [] };
    }
}

// Submit survey registration - link org to sports using existing endpoints
export interface SurveySubmissionPayload {
    organization_id: number;
    event_id: number;
    sport_ids: number[];
}

export async function submitSurvey(payload: SurveySubmissionPayload): Promise<void> {
    try {
        const { organization_id, event_id, sport_ids } = payload;

        console.log('📤 submitSurvey - Payload:', { organization_id, event_id, sport_ids });

        // Link each sport to the organization for this event
        const linkPromises = sport_ids.map((sport_id) => {
            console.log(`📤 Submitting: org_id=${organization_id}, events_id=${event_id}, sports_id=${sport_id}`);
            return apiClient.post('/api/events/add-org-to-sport', {
                org_id: organization_id,
                events_id: event_id,
                sports_id: sport_id,
            });
        });

        await Promise.all(linkPromises);
    } catch (error) {
        console.error('Error submitting survey:', error);
        throw error;
    }
}

export function clearCache(): void {
    cache.clear();
}

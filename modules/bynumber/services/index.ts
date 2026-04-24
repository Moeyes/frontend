/**
 * bynumber Feature - Services
 * API calls and business logic for bynumber feature
 */

import apiClient from '@/core/api/client';
import { AxiosError } from 'axios';
import type { Event, Organization, Sport, SportRow } from '../types';

// Backend response types
interface SportsEventResponse {
    id: number;           // join table ID
    event_name?: string;
    sport_name?: string;
    created_at?: string;
}

interface SportEventOrgResponse {
    id: number;
    organization_id: number;
    organization_name: string;
    created_at: string;
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

export async function fetchAllSports(): Promise<{ id: number; name_kh: string }[]> {
    try {
        const cached = getCache<{ id: number; name_kh: string }[]>('all-sports');
        if (cached) return cached;

        const response = await apiClient.get<{ data: { id: number; name_kh: string }[] }>('/api/sports?skip=0&limit=200');
        const sports = response.data.data || [];
        setCache('all-sports', sports);
        return sports;
    } catch (error) {
        console.error('Error fetching all sports:', error);
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
        if (cached) return cached;

        const response = await apiClient.get<SportsEventResponse[]>(`/api/events/${eventId}/sports`);
        const sportsEvents = response.data || [];

        const sports: Sport[] = sportsEvents.map((se) => ({
            id: se.id, // This is the sports_event link ID
            name_kh: se.sport_name || '',
            sport_type: undefined,
            created_at: se.created_at,
        }));

        setCache(cacheKey, sports);
        return sports;
    } catch (error) {
        console.error('Error fetching event sports:', error);
        return [];
    }
}

// Fetch all data needed for bynumber form
export async function fetchByNumberData() {
    try {
        const [events, organizations] = await Promise.all([
            fetchEvents(),
            fetchAllOrganizations(),
        ]);
        return { events, organizations };
    } catch (error) {
        console.error('Error fetching bynumber data:', error);
        return { events: [], organizations: [] };
    }
}

/**
 * FETCH ORG EVENT SPORTS - FRONTEND ONLY IMPLEMENTATION
 */
export async function fetchOrgEventSports(
    organizationId: number,
    eventId: number
): Promise<SportRow[]> {
    try {
        const cacheKey = `org-event-sports-${organizationId}-${eventId}`;
        const cached = getCache<SportRow[]>(cacheKey);
        if (cached) return cached;

        // 1. Get all sports assigned to this event
        const eventSportsResponse = await apiClient.get<SportsEventResponse[]>(`/api/events/${eventId}/sports`);
        const eventSports = eventSportsResponse.data || [];

        // 2. Fetch all sports to get their IDs
        const allSportsResponse = await apiClient.get<{data: Sport[]}>('/api/sports?limit=200');
        const allSports = allSportsResponse.data.data || [];

        const sportsResults: SportRow[] = [];

        // 3. For each sport in event, check if org is in its list
        const orgCheckPromises = eventSports.map(async (es) => {
            const matchedSport = allSports.find(s => s.name_kh === es.sport_name);
            if (!matchedSport) return;

            try {
                const orgsResponse = await apiClient.get<SportEventOrgResponse[]>(`/api/events/${eventId}/sports/${matchedSport.id}/orgs`);
                const orgs = orgsResponse.data || [];
                const ourOrgLink = orgs.find(o => o.organization_id === organizationId);
                
                if (ourOrgLink) {
                    sportsResults.push({
                        sport_id: matchedSport.id,
                        sport_name_kh: es.sport_name || '',
                        athlete_male_count: 0,
                        athlete_female_count: 0,
                        leader_male_count: 0,
                        leader_female_count: 0,
                        sportsEventOrgId: ourOrgLink.id
                    });
                }
            } catch (e) {
                console.warn(`Could not fetch orgs for sport ${matchedSport.id}`, e);
            }
        });

        await Promise.all(orgCheckPromises);

        setCache(cacheKey, sportsResults);
        return sportsResults;
    } catch (error) {
        console.error('Error fetching org event sports:', error);
        return [];
    }
}

// Submit payload type
export interface ByNumberSubmissionPayload {
    organization_id: number;
    event_id: number;
    sports: Array<{
        sport_id: number;
        athlete_male_count: number;
        athlete_female_count: number;
        leader_male_count: number;
        leader_female_count: number;
    }>;
}

// Always POST — backend create() handles sports_event_org upsert internally
export async function submitByNumber(payload: ByNumberSubmissionPayload): Promise<void> {
    const { organization_id, event_id, sports } = payload;

    const submitPromises = sports.map(async (sport) => {
        try {
            await apiClient.post('/api/participation/', {
                org_id: organization_id,
                events_id: event_id,
                sports_id: sport.sport_id,
                organization_id: organization_id,
                athlete_male_count: sport.athlete_male_count,
                athlete_female_count: sport.athlete_female_count,
                leader_male_count: sport.leader_male_count,
                leader_female_count: sport.leader_female_count,
            });
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 400) {
                console.warn(`ℹ️ Participation already exists for sport ${sport.sport_id}. Skipping.`);
                return;
            }
            throw error;
        }
    });

    try {
        await Promise.all(submitPromises);
        cache.delete(`org-event-sports-${organization_id}-${event_id}`);
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('❌ API Error Details:', error.response?.data);
        }
        throw error;
    }
}

export function clearCache(): void {
    cache.clear();
}

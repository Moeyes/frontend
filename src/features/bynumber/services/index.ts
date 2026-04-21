/**
 * bynumber Feature - Services
 * API calls and business logic for bynumber feature
 */

import apiClient from '@/lib/api/client';
import type { Event, Organization, Sport, SportRow } from '../types';

// Backend response types
interface SportsEventResponse {
    id: number;
    sports_id?: number;
    event_name?: string;
    sport_name?: string;
    created_at?: string;
}

interface OrgSportResponse {
    id?: number;
    org_id?: number;
    events_id?: number;
    sports_id?: number;
    athlete_male_count?: number;
    athlete_female_count?: number;
    leader_male_count?: number;
    leader_female_count?: number;
    sports_events_org_id?: number;
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
        if (cached) return cached;

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

// Fetch organization's sports for a specific event
export async function fetchOrgEventSports(
    organizationId: number,
    eventId: number
): Promise<SportRow[]> {
    try {
        const cacheKey = `org-event-sports-${organizationId}-${eventId}`;
        const cached = getCache<SportRow[]>(cacheKey);
        if (cached) return cached;

        // Get sports selected by org from survey (from sports_event_org table)
        const response = await apiClient.get<{ data: any[], count: number }>(
            `/api/events/${eventId}/organizations/${organizationId}/sports`
        );

        const orgSports = response.data.data || [];

        // Map to SportRow format with counts initialized to 0
        const sports: SportRow[] = orgSports.map((sport: any) => ({
            sport_id: sport.sport_id || sport.sportId,
            sport_name_kh: sport.sport_name_kh || '',
            athlete_male_count: 0,
            athlete_female_count: 0,
            leader_male_count: 0,
            leader_female_count: 0,
            sportsEventOrgId: sport.sports_event_org_id || sport.id,
        }));

        setCache(cacheKey, sports);
        return sports;
    } catch (error) {
        console.error('Error fetching org event sports:', error);
        return [];
    }
}

// Submit bynumber registration - submit participation counts using existing endpoint
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

export async function submitByNumber(payload: ByNumberSubmissionPayload): Promise<void> {
    try {
        const { organization_id, event_id, sports } = payload;

        // Submit participation counts for each sport
        const submitPromises = sports.map((sport) =>
            apiClient.post('/api/participation-per-sport', {
                org_id: organization_id,
                events_id: event_id,
                sports_id: sport.sport_id,
                organization_id: organization_id,
                athlete_male_count: sport.athlete_male_count,
                athlete_female_count: sport.athlete_female_count,
                leader_male_count: sport.leader_male_count,
                leader_female_count: sport.leader_female_count,
            })
        );

        await Promise.all(submitPromises);
    } catch (error) {
        console.error('Error submitting bynumber:', error);
        throw error;
    }
}

export function clearCache(): void {
    cache.clear();
}

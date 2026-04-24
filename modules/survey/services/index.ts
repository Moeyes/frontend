/**
 * survey Feature - Services
 * API calls and business logic for survey feature
 */

import apiClient from '@/core/api/client';
import { AxiosError } from 'axios';
import type { Event, Organization, Sport } from '../types';

// Backend response types
interface SportsEventResponse {
    id: number;           // join table ID — DO NOT use this as sports_id
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

        // Fetch both event-specific sports (which lacks IDs) and all sports (to get IDs)
        const [eventSportsResponse, allSports] = await Promise.all([
            apiClient.get<SportsEventResponse[]>(`/api/events/${eventId}/sports`),
            fetchAllSports()
        ]);

        const sportsEvents = eventSportsResponse.data || [];

        // Map SportsEventPublic response to Sport interface using name matching for sports_id
        const sports: Sport[] = sportsEvents.map((se) => {
            const matchedSport = allSports.find(s => s.name_kh === se.sport_name);
            return {
                id: se.id,
                sports_id: matchedSport ? matchedSport.id : 0,
                name_kh: se.sport_name || '',
                created_at: se.created_at,
            };
        }).filter(s => s.sports_id !== 0); // Only include sports we could resolve

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

// Submit survey registration
export interface SurveySubmissionPayload {
    organization_id: number;
    event_id: number;
    sport_ids: number[];
}

export async function submitSurvey(payload: SurveySubmissionPayload): Promise<void> {
    const { organization_id, event_id, sport_ids } = payload;
    
    console.log('🚀 Submitting Survey Payload:', {
        org_id: organization_id,
        events_id: event_id,
        sports_id: sport_ids
    });

    // Link each sport to the organization for this event
    const linkPromises = sport_ids.map(async (sport_id) => {
        const body = {
            org_id: organization_id,
            events_id: event_id,
            sports_id: sport_id,
        };
        
        try {
            console.log('📡 POST /api/events/add-org-to-sport', body);
            await apiClient.post('/api/events/add-org-to-sport', body);
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 400) {
                const detail = (error.response.data)?.detail;
                if (detail === 'This organization is already linked to this sport event.') {
                    console.warn(`ℹ️ Organization already registered for sport ${sport_id}. Skipping.`);
                    return; // Ignore duplicate error
                }
            }
            throw error;
        }
    });

    try {
        await Promise.all(linkPromises);
        console.log('✅ Survey submission processing complete');
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

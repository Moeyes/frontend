/**
 * Registration Data Service
 * 
 * Fetches all registration-related data from backend APIs
 * Keeps it simple and organized - minimal API calls
 */

import apiClient from '@/lib/api/client';

// ─── Types ───────────────────────────────────────────────────────────

export interface Event {
    id: number;
    name_kh: string;
    name_en: string;
    type?: string;
}

export interface Organization {
    id: number;
    name_kh: string;
    name_en: string;
}

export interface Sport {
    id: number;
    name_kh: string;
    name_en: string;
}

export interface Category {
    id: number;
    category: string;  // Changed from category_name
    sport_name?: string;
    gender?: string;
    created_at?: string;
}

// Cache for API responses to avoid repeated calls
interface CacheData {
    [key: string]: CascadingDataLoaded | Event[] | Organization[] | Sport[] | Category[] | string[];
}
const cache: CacheData = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps: Record<string, number> = {};

function isCacheValid(key: string): boolean {
    const timestamp = cacheTimestamps[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
}

function setCache<T>(key: string, value: T): void {
    cache[key] = value as CacheData[string];
    cacheTimestamps[key] = Date.now();
}

function getCache<T>(key: string): T | null {
    if (isCacheValid(key)) {
        return cache[key] as T;
    }
    delete cache[key];
    delete cacheTimestamps[key];
    return null;
}

// ─── Events ───────────────────────────────────────────────────────────

/**
 * Fetch all events
 * GET /api/events?skip=0&limit=100
 */
export async function fetchEvents(): Promise<Event[]> {
    const cacheKey = 'events';
    const cached = getCache<Event[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiClient.get('/api/events', {
            params: { skip: 0, limit: 100 },
        });
        const events = response.data.data || [];
        setCache(cacheKey, events);
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// ─── Organizations ───────────────────────────────────────────────────

/**
 * Fetch all organizations
 * GET /api/organization?skip=0&limit=100 (note: singular endpoint!)
 */
export async function fetchAllOrganizations(): Promise<Organization[]> {
    const cacheKey = 'organizations:all';
    const cached = getCache<Organization[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiClient.get('/api/organization', {
            params: { skip: 0, limit: 100 },
        });
        const orgs = response.data.data || [];
        setCache(cacheKey, orgs);
        return orgs;
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return [];
    }
}

// ─── Sports ───────────────────────────────────────────────────────────

/**
 * Fetch all sports
 * GET /api/sports?skip=0&limit=100
 */
export async function fetchAllSports(): Promise<Sport[]> {
    const cacheKey = 'sports:all';
    const cached = getCache<Sport[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiClient.get('/api/sports', {
            params: { skip: 0, limit: 100 },
        });
        const sports = response.data.data || [];
        setCache(cacheKey, sports);
        return sports;
    } catch (error) {
        console.error('Error fetching sports:', error);
        return [];
    }
}

// ─── Categories ───────────────────────────────────────────────────────

/**
 * Fetch categories for a specific sport and event
 * GET /api/events/{event_id}/sports/{sport_id}/categories
 */
export async function fetchCategories(
    eventId: number,
    sportId: number
): Promise<Category[]> {
    const cacheKey = `categories:${eventId}:${sportId}`;
    const cached = getCache<Category[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiClient.get(
            `/api/events/${eventId}/sports/${sportId}/categories`
        );
        // Backend returns array directly, not wrapped in { data: [...] }
        const categories = Array.isArray(response.data) ? response.data : [];
        setCache(cacheKey, categories);
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// ─── Cascading Filters (One-Time Load) ───────────────────────────────

export interface CascadingDataLoaded {
    eventTypes: string[];
    events: Event[];
    organizations: Organization[];
    sports: Sport[];
}

/**
 * Extract unique event types from events
 */
export function getUniqueEventTypes(events: Event[]): string[] {
    const types = new Set<string>();
    events.forEach((event) => {
        if (event.type) types.add(event.type);
    });
    const result = Array.from(types).sort();
    return result;
}

/**
 * Load all cascading data in one go (events, orgs, sports)
 * This is called once on component mount
 */
export async function loadCascadingData(): Promise<CascadingDataLoaded> {
    const cacheKey = 'cascading:all';
    const cached = getCache<CascadingDataLoaded>(cacheKey);
    if (cached) return cached;

    try {
        const [events, organizations, sports] = await Promise.all([
            fetchEvents(),
            fetchAllOrganizations(),
            fetchAllSports(),
        ]);

        const eventTypes = getUniqueEventTypes(events);
        const data = { eventTypes, events, organizations, sports };
        setCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error loading cascading data:', error);
        return { eventTypes: [], events: [], organizations: [], sports: [] };
    }
}

// ─── Filtering Helpers ────────────────────────────────────────────────

/**
 * Calculate age from birth date
 */
export function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

import apiClient from '@/core/api/client';

export interface EventReference {
    id: number;
    name_kh: string;
    name_en: string;
    type?: string;
}

export interface OrganizationReference {
    id: number;
    name_kh: string;
    name_en: string;
    code?: string;
}

export interface SportReference {
    id: number;
    name_kh: string;
    name_en: string;
}

export interface CategoryReference {
    id: number;
    category: string;
    sport_name?: string;
    gender?: string;
    created_at?: string;
}

export interface CascadingDataLoaded {
    eventTypes: string[];
    events: EventReference[];
    organizations: OrganizationReference[];
    sports: SportReference[];
}

interface CacheData {
    [key: string]:
        | CascadingDataLoaded
        | EventReference[]
        | OrganizationReference[]
        | SportReference[]
        | CategoryReference[]
        | string[];
}

const cache: CacheData = {};
const cacheTimestamps: Record<string, number> = {};
const CACHE_DURATION = 5 * 60 * 1000;

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

export async function fetchEvents(): Promise<EventReference[]> {
    const cacheKey = 'events';
    const cached = getCache<EventReference[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiClient.get('/api/events', {
            params: { skip: 0, limit: 100 },
        });
        const events = response.data.data || [];
        setCache(cacheKey, events);
        return events;
    } catch {
        return [];
    }
}

export async function fetchAllOrganizations(): Promise<OrganizationReference[]> {
    const cacheKey = 'organizations:all';
    const cached = getCache<OrganizationReference[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiClient.get('/api/organization', {
            params: { skip: 0, limit: 100 },
        });
        const organizations = response.data.data || [];
        setCache(cacheKey, organizations);
        return organizations;
    } catch {
        return [];
    }
}

export async function fetchAllSports(): Promise<SportReference[]> {
    const cacheKey = 'sports:all';
    const cached = getCache<SportReference[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiClient.get('/api/sports', {
            params: { skip: 0, limit: 100 },
        });
        const sports = response.data.data || [];
        setCache(cacheKey, sports);
        return sports;
    } catch {
        return [];
    }
}

export async function fetchCategories(
    eventId: number,
    sportId: number
): Promise<CategoryReference[]> {
    const cacheKey = `categories:${eventId}:${sportId}`;
    const cached = getCache<CategoryReference[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await apiClient.get(`/api/events/${eventId}/sports/${sportId}/categories`);
        const categories = Array.isArray(response.data) ? response.data : [];
        setCache(cacheKey, categories);
        return categories;
    } catch {
        return [];
    }
}

export function getUniqueEventTypes(events: EventReference[]): string[] {
    const types = new Set<string>();
    events.forEach((event) => {
        if (event.type) types.add(event.type);
    });
    return Array.from(types).sort();
}

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

        const data = {
            eventTypes: getUniqueEventTypes(events),
            events,
            organizations,
            sports,
        };

        setCache(cacheKey, data);
        return data;
    } catch {
        return { eventTypes: [], events: [], organizations: [], sports: [] };
    }
}

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

import apiClient from '@/core/api/client';

function buildUrl(path: string): string {
    const base =
        typeof window === 'undefined'
            ? (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000')
            : '';
    return `${base}${path}`;
}

type EventServiceResponse = Record<string, unknown> & {
    name: string;
    name_kh: string;
    registration_is_open?: boolean;
    registration_open_date?: string;
    registration_close_date?: string;
};

export async function getEventById(eventId: number): Promise<EventServiceResponse> {
    const path = typeof window === 'undefined' ? `/api/public/events/${eventId}` : `/api/events/${eventId}`;
    const { data } = await apiClient.get(buildUrl(path));
    const raw = data as Record<string, unknown>;
    return {
        ...raw,
        name: raw.name_kh ?? 'Unnamed Event',
        name_kh: raw.name_kh,
    } as EventServiceResponse;
}

export const eventsService = { getEventById };
export default eventsService;

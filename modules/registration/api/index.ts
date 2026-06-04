import apiClient from '@/core/api/client';
import { API } from '@/core/api/endpoints';
import type { RegisterPayload } from '../types';

export async function apiRegisterParticipant(payload: RegisterPayload) {
    const { data } = await apiClient.post(`${API.registration.base}/`, payload);
    return data;
}

/**
 * List/search registrations. Filters (incl. the free-text `search`, which may
 * contain names or phone numbers) go in the POST body, never the URL, so
 * Restricted-PII stays out of browser history, referrers and access logs
 * (data-governance §3). The backend POST /search mirrors the GET list, with the
 * same org scoping derived from the auth token.
 */
export async function apiSearchRegistrations(params?: Record<string, unknown>) {
    const { skip, ...rest } = params ?? {};
    const { data } = await apiClient.post(API.registration.search, { ...rest, offset: skip });
    return data;
}

/**
 * Reveal a participant's masked phone. POST (no body) so the action is a
 * deliberate, CSRF-protected request; the backend is admin-only and audits the
 * access (data-governance §4/§6).
 */
export async function apiRevealParticipantPii(enrollId: number) {
    const { data } = await apiClient.post(API.registration.reveal(enrollId), {});
    return data;
}

export async function apiGetRegistration(enrollId: number) {
    const { data } = await apiClient.get(API.registration.byId(enrollId));
    return data;
}

export async function apiUpdateRegistration(enrollId: number, payload: Record<string, unknown>) {
    const { data } = await apiClient.patch(API.registration.update, { enroll_id: enrollId, ...payload });
    return data;
}

export async function apiDeleteRegistration(enrollId: number) {
    const { data } = await apiClient.delete(API.registration.delete, { data: { enroll_id: enrollId } });
    return data;
}

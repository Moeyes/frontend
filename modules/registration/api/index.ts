import apiClient from '@/core/api/client';
import { API } from '@/core/api/endpoints';
import type { RegisterPayload } from '../types';

export async function apiRegisterParticipant(payload: RegisterPayload) {
    const { data } = await apiClient.post(`${API.registration.base}/`, payload);
    return data;
}

export async function apiGetRegistrations(params?: Record<string, unknown>) {
    const { skip, ...rest } = params ?? {};
    const { data } = await apiClient.get(`${API.registration.base}/`, { params: { ...rest, offset: skip } });
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

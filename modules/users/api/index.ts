/**
 * modules/users/api/index.ts
 *
 * Raw HTTP calls. Only the adapter imports from here.
 * Hooks and components MUST NOT import from this file directly.
 *
 * Backend shapes:
 *   GET    /api/users/        → { data: UserPublic[], count: number }
 *   GET    /api/users/:id     → UserPublic
 *   POST   /api/users/        → UserPublic
 *   PATCH  /api/users/update  → UserPublic  (body: { user_id, data })
 *   DELETE /api/users/delete  → void        (body: { user_id })
 */
import apiClient from '@/core/api/client';
import type { UserCreate, UserUpdate } from '../types';

const BASE = '/api/users';

export async function apiGetUsers(params?: Record<string, unknown>) {
    const { data } = await apiClient.get<unknown>(`${BASE}/`, { params });
    return data;
}

export async function apiGetUserById(userId: string) {
    const { data } = await apiClient.get<unknown>(`${BASE}/${userId}`);
    return data;
}

export async function apiCreateUser(payload: UserCreate) {
    const { data } = await apiClient.post<unknown>(`${BASE}/`, payload);
    return data;
}

export async function apiUpdateUser(payload: UserUpdate) {
    const { id, ...fields } = payload;
    const { data } = await apiClient.patch<unknown>(`${BASE}/update`, {
        user_id: id,
        data: fields,
    });
    return data;
}

export async function apiDeleteUser(userId: string): Promise<void> {
    await apiClient.delete(`${BASE}/delete`, { data: { user_id: userId } });
}

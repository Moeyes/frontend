/**
 * Participation Per Sport Service
 */

import apiClient from '@/core/api/client';
import {
    ParticipationPerSport,
    ParticipationPerSportPayload,
    ParticipationPerSportListResponse,
} from '../types';

/**
 * Create a new participation per sport entry
 * POST /api/participation-per-sport/
 */
export async function createParticipation(payload: ParticipationPerSportPayload): Promise<ParticipationPerSport> {
    const response = await apiClient.post<ParticipationPerSport>(
        '/api/participation-per-sport/',
        payload
    );
    return response.data;
}

/**
 * List all participation per sport entries
 * GET /api/participation-per-sport/
 */
export async function getParticipations(params?: {
    skip?: number;
    limit?: number;
    organization_id?: number;
    event_id?: number;
    sport_id?: number;
}): Promise<ParticipationPerSportListResponse> {
    const response = await apiClient.get<ParticipationPerSportListResponse>(
        '/api/participation-per-sport/',
        { params }
    );
    return response.data;
}

/**
 * Get a single participation entry by ID
 * GET /api/participation-per-sport/{id}
 */
export async function getParticipation(id: number): Promise<ParticipationPerSport> {
    const response = await apiClient.get<ParticipationPerSport>(
        `/api/participation-per-sport/${id}`
    );
    return response.data;
}

/**
 * Update an existing participation entry
 * PATCH /api/participation-per-sport/{id}
 */
export async function updateParticipation(id: number, payload: Partial<ParticipationPerSportPayload>): Promise<ParticipationPerSport> {
    const response = await apiClient.patch<ParticipationPerSport>(
        `/api/participation-per-sport/${id}`,
        payload
    );
    return response.data;
}

/**
 * Delete a participation entry
 * DELETE /api/participation-per-sport/{id}
 */
export async function deleteParticipation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
        `/api/participation-per-sport/${id}`
    );
    return response.data;
}

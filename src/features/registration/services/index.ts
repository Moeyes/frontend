/**
 * Registration Service
 * 
 * API service for participant registration and management
 */

import apiClient from '@/lib/api/client';
import {
    RegisterPayload,
    RegisterResponse,
    Enrollment,
    EnrollmentListResponse,
} from '@/features/registration/types';

/**
 * Register a new participant
 * POST /api/registration/
 */
export async function registerParticipant(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
        '/api/registration/',
        payload
    );
    return response.data;
}

/**
 * List all registrations (with optional filtering)
 * GET /api/registration/
 */
export async function getRegistrations(params?: { 
    skip?: number; 
    limit?: number;
    organization_id?: number;
    event_id?: number;
    sport_id?: number;
    search?: string;
}): Promise<EnrollmentListResponse> {
    const response = await apiClient.get<EnrollmentListResponse>(
        '/api/registration/',
        { params }
    );
    return response.data;
}

/**
 * Get a single registration by ID
 * GET /api/registration/{enroll_id}
 */
export async function getRegistration(enrollId: number): Promise<Enrollment> {
    const response = await apiClient.get<Enrollment>(
        `/api/registration/${enrollId}`
    );
    return response.data;
}

/**
 * Update an existing registration
 * PATCH /api/registration/update
 * Note: Backend might expect specific format for update
 */
export async function updateRegistration(enrollId: number, payload: Partial<RegisterPayload>): Promise<Enrollment> {
    const response = await apiClient.patch<Enrollment>(
        '/api/registration/update',
        { enroll_id: enrollId, ...payload }
    );
    return response.data;
}

/**
 * Delete a registration
 * DELETE /api/registration/delete
 */
export async function deleteRegistration(enrollId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
        '/api/registration/delete',
        { data: { enroll_id: enrollId } }
    );
    return response.data;
}

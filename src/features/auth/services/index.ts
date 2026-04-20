/**
 * Registration Service
 * 
 * API service for user registration
 */

import apiClient from '@/lib/api/client';
import {
    RegisterPayload,
    RegisterResponse,
} from '@/features/auth/types';

/**
 * Register a new user
 * 
 * @param payload - The registration data
 * @returns The registration response with enroll_id
 */
export async function registerUser(
    payload: RegisterPayload
): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
        '/api/registration/',
        payload
    );

    return response.data;
}

export default {
    registerUser,
};

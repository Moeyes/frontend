/**
 * Registration Service
 * 
 * API service for user registration
 */

// import unauthenticatedApiClient from '@/lib/api/unauthenticated-client';
import {
    RegisterPayload,
    RegisterResponse,
} from '@/features/registration/types';
import unauthenticatedApiClient from '@/lib/api/unauthenticatedApiClient';

/**
 * Register a new user
 * 
 * @param payload - The registration data
 * @returns The registration response with enroll_id
 */
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await unauthenticatedApiClient.post<RegisterResponse>(
        '/api/registration/',
        payload
    );
    return response.data;
}
// export default {
//     registerUser,
// };

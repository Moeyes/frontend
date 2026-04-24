import apiClient from '@/core/api/client';
import type { User } from '@/core/auth';
import { UserCreate, UserUpdate } from '../types';

const BASE_URL = '/api/users';

type ApiCollectionResponse<T> = T[] | { data?: T[] };
type ApiItemResponse<T> = T | { data?: T };

function extractCollection<T>(payload: ApiCollectionResponse<T>): T[] {
    if (Array.isArray(payload)) return payload;
    if (payload.data && Array.isArray(payload.data)) return payload.data;
    return [];
}

function extractItem<T>(payload: ApiItemResponse<T>): T {
    return (typeof payload === 'object' && payload !== null && 'data' in payload
        ? payload.data
        : payload) as T;
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
    const response = await apiClient.get<ApiCollectionResponse<User>>(`${BASE_URL}/`);
    return extractCollection(response.data);
}

/**
 * Get single user by ID
 */
export async function getUserById(userId: string): Promise<User> {
    const { data } = await apiClient.get<ApiItemResponse<User>>(`${BASE_URL}/${userId}`);
    return extractItem(data);
}

/**
 * Create a new user
 */
export async function createUser(userData: UserCreate): Promise<User> {
    const { data } = await apiClient.post<ApiItemResponse<User>>(`${BASE_URL}/`, userData);
    return extractItem(data);
}

/**
 * Update an existing user
 */
export async function updateUser(userData: UserUpdate): Promise<User> {
    const { data } = await apiClient.patch<ApiItemResponse<User>>(`${BASE_URL}/update`, userData);
    return extractItem(data);
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/delete`, { params: { user_id: userId } });
}

export const usersService = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};

export default usersService;

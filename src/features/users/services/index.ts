import apiClient from '@/lib/api/client';
import { User } from '@/features/auth/types';
import { UserCreate, UserUpdate } from '../types';

const BASE_URL = '/api/users';

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
    const response = await apiClient.get<any>(`${BASE_URL}/`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
}

/**
 * Get single user by ID
 */
export async function getUserById(userId: string): Promise<User> {
    const { data } = await apiClient.get<any>(`${BASE_URL}/${userId}`);
    return data?.data || data;
}

/**
 * Create a new user
 */
export async function createUser(userData: UserCreate): Promise<User> {
    const { data } = await apiClient.post<any>(`${BASE_URL}/`, userData);
    return data?.data || data;
}

/**
 * Update an existing user
 */
export async function updateUser(userData: UserUpdate): Promise<User> {
    const { data } = await apiClient.patch<any>(`${BASE_URL}/update`, userData);
    return data?.data || data;
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

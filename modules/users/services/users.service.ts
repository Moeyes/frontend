import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type UserPublic    = components['schemas']['UserPublic'];
export type UserCreate    = components['schemas']['UserCreate'];
export type UserUpdate    = components['schemas']['UserUpdate'];
export type UsersPublic   = components['schemas']['UsersPublic'];
export type UserRole      = components['schemas']['UserRole'];

export interface ListUsersParams {
  skip?: number;
  limit?: number;
  role?: string | null;
  username?: string | null;
  email?: string | null;
}

export async function listUsers(params?: ListUsersParams): Promise<UsersPublic> {
  const { data, error } = await api.GET('/api/users/', { params: { query: params } });
  if (error) throw error;
  return data;
}

export async function getUser(userId: string): Promise<UserPublic> {
  const { data, error } = await api.GET('/api/users/{user_id}', {
    params: { path: { user_id: userId } },
  });
  if (error) throw error;
  return data;
}

export async function createUser(body: UserCreate): Promise<UserPublic> {
  const { data, error } = await api.POST('/api/users/', { body });
  if (error) throw error;
  return data;
}

export async function updateUser(userId: string, updates: UserUpdate): Promise<UserPublic> {
  const { data, error } = await api.PATCH('/api/users/update', {
    body: { user_id: userId, data: updates },
  });
  if (error) throw error;
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await api.DELETE('/api/users/delete', {
    body: { user_id: userId },
  });
  if (error) throw error;
}

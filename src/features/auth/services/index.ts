import apiClient from '@/lib/api/client';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from '@/features/auth/types';
import { User } from '@/features/auth/types';

const BASE = '/api/auth';

// POST /api/auth/login → returns { access_token, refresh_token, token_type }
// Backend also sets HttpOnly cookie for refresh_token
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(`${BASE}/login`, credentials);
  return data;
}

// POST /api/auth/refresh → NO body needed, browser sends cookie automatically
// Backend validates cookie against refresh_tokens table, returns new pair
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const { data } = await apiClient.post<RefreshTokenResponse>(`${BASE}/refresh`, {});
  return data;
}

// GET /api/auth/session/{user_id} → returns full UserPublic
export async function getUserSession(userId: string): Promise<User> {
  const { data } = await apiClient.get<User>(`${BASE}/session/${userId}`);
  return data;
}

// No logout endpoint in the backend — clear locally only
export async function logoutUser(): Promise<void> {
  // If you add DELETE /api/auth/logout later, call it here
  return Promise.resolve();
}

export const authService = { loginUser, refreshAccessToken, getUserSession, logoutUser };
export default authService;
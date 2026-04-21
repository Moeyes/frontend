/**
 * Authentication Service
 * 
 * API calls for login, logout, token refresh, and session management
 */

import apiClient from '@/lib/api/client';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  User,
  UserSession,
} from '@/features/auth/types';

const API_BASE = '/api/auth';

/**
 * Login user with username and password
 */
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    `${API_BASE}/login`,
    credentials
  );
  return response.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  request: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>(
    `${API_BASE}/refresh`,
    request
  );
  return response.data;
}

/**
 * Logout user and revoke refresh token
 */
export async function logoutUser(request?: LogoutRequest): Promise<LogoutResponse> {
  const response = await apiClient.post<LogoutResponse>(
    `${API_BASE}/logout`,
    request || {}
  );
  return response.data;
}

/**
 * Get current user session
 */
export async function getCurrentSession(): Promise<UserSession> {
  const response = await apiClient.get<UserSession>(
    `${API_BASE}/session`
  );
  return response.data;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>(
    `${API_BASE}/me`
  );
  return response.data;
}

/**
 * Validate if token is still valid
 */
export async function validateToken(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

export const authService = {
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentSession,
  getCurrentUser,
  validateToken,
};

export default authService;

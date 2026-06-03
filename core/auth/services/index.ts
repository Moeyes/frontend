import apiClient from '@/core/api/client';
import unauthenticatedApiClient from '@/core/api/unauthenticatedApiClient';
import { LoginRequest, User } from '@/core/auth/types';

const BASE = '/api/auth';

// --- Types -----------------------------------------------------------

export interface TokenPair {
    access_token: string;
    refresh_token: string;
    token_type?: string;
}

// --- API calls -------------------------------------------------------

/**
 * POST /api/auth/login
 * Sends credentials → backend sets HttpOnly cookies AND returns TokenPair in body.
 * We return the pair so the caller can extract the user_id for the session fetch.
 */
export async function loginUser(credentials: LoginRequest): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>(`${BASE}/login`, credentials);
    return data;
}

/**
 * POST /api/auth/refresh
 * Browser sends refresh_token HttpOnly cookie automatically.
 * Returns a fresh TokenPair so the caller can re-derive the user_id.
 */
export async function refreshAccessToken(): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>(`${BASE}/refresh`, {});
    return data;
}

/**
 * GET /api/auth/me
 * Resolve the current user straight from the HttpOnly `access_token` cookie —
 * a single-round-trip "who am I?" with no user id in the URL and no client-side
 * token decoding. This is what lets the session be restored on load without
 * persisting any user data in the browser.
 */
export async function getCurrentUser(signal?: AbortSignal): Promise<User> {
    const { data } = await apiClient.get<User>(`${BASE}/me`, { signal });
    return data;
}

/**
 * Logout: tell the backend to revoke the refresh token and clear the auth
 * cookies, then AuthContext dispatches LOGOUT to wipe in-memory state.
 * Without this server call the HttpOnly refresh_token cookie survives and the
 * session is silently restored on the next page load.
 */
export async function logoutUser(): Promise<void> {
    await unauthenticatedApiClient.post(`${BASE}/logout`, {});
}

export const authService = {
    loginUser,
    refreshAccessToken,
    getCurrentUser,
    logoutUser,
};

export default authService;
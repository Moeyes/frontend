import apiClient from '@/core/api/client';
import { LoginRequest, User } from '@/core/auth/types';

const BASE = '/api/auth';

// --- Types -----------------------------------------------------------

export interface TokenPair {
    access_token: string;
    refresh_token: string;
    token_type?: string;
}

// --- Helpers ---------------------------------------------------------

/**
 * Decode the JWT payload (no verification — purely for reading claims client-side).
 * The backend verifies the signature on every request; we only need sub/user_id here.
 */
function decodeJwt(token: string): Record<string, unknown> {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        throw new Error('Invalid token format');
    }
}

/**
 * Extract the user UUID from the access token's `sub` claim.
 */
export function getUserIdFromToken(token: string): string {
    const payload = decodeJwt(token);
    const sub = payload.sub as string | undefined;
    if (!sub) throw new Error('Token is missing `sub` claim');
    return sub;
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
 * GET /api/auth/session/:userId
 * Fetch the user record by UUID — the only "who am I?" endpoint the backend exposes.
 */
export async function getUserById(userId: string): Promise<User> {
    const { data } = await apiClient.get<User>(`${BASE}/session/${userId}`);
    return data;
}

/**
 * Logout is handled client-side only (no backend logout endpoint).
 * The refresh_token cookie will expire naturally on the server.
 * AuthContext dispatches LOGOUT which clears all in-memory state.
 */
export async function logoutUser(): Promise<void> {
    // no-op — intentional
}

export const authService = {
    loginUser,
    refreshAccessToken,
    getUserById,
    getUserIdFromToken,
    logoutUser,
};

export default authService;
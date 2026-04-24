'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useRef,
} from 'react';
import { AuthContextType, AuthState, User, UserRole } from '@/core/auth/types';
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserById,
    getUserIdFromToken,
} from '@/core/auth/services';
import unauthenticatedApiClient from '@/core/api/unauthenticatedApiClient';

// --- Constants -------------------------------------------------------

const CACHE_KEY = 'auth_user_cache';

// --- Role normalisation ----------------------------------------------

function normalizeRole(raw: string): UserRole {
    const map: Record<string, UserRole> = {
        admin:  UserRole.ADMIN,        ADMIN:  UserRole.ADMIN,
        USER1:  UserRole.ORGANIZATION, user1:  UserRole.ORGANIZATION,
        USER2:  UserRole.FEDERATION,   user2:  UserRole.FEDERATION,
        GUEST:  UserRole.GUEST,        guest:  UserRole.GUEST,
    };
    const normalized = map[raw];
    if (!normalized) console.warn(`Unknown role: "${raw}" — defaulting to GUEST`);
    return normalized ?? UserRole.GUEST;
}

// --- Cache helpers ---------------------------------------------------

interface CachedAuth {
    user: User;
    role: UserRole;
}

function readCache(): CachedAuth | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as CachedAuth;
    } catch {
        return null;
    }
}

function writeCache(user: User, role: UserRole): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ user, role }));
    } catch {
        // localStorage full or unavailable — non-fatal
    }
}

function clearCache(): void {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch { /* non-fatal */ }
}

// --- Reducer ---------------------------------------------------------

type Action =
    | { type: 'LOADING' }
    | { type: 'SET_USER'; user: User; role: UserRole }
    | { type: 'SET_ERROR'; error: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'LOGOUT' };

const EMPTY: AuthState = {
    user: null, role: null,
    isAuthenticated: false, isLoading: false, error: null,
};

function reducer(state: AuthState, action: Action): AuthState {
    switch (action.type) {
        case 'LOADING':     return { ...state, isLoading: true, error: null };
        case 'SET_USER':    return { ...EMPTY, isAuthenticated: true, user: action.user, role: action.role };
        case 'SET_ERROR':   return { ...state, isLoading: false, error: action.error };
        case 'CLEAR_ERROR': return { ...state, error: null };
        case 'LOGOUT':      return { ...EMPTY };
        default:            return state;
    }
}

// --- Helpers ---------------------------------------------------------

/**
 * Resolve a full User from a raw access_token string.
 * Decodes the JWT to extract user_id, then hits GET /api/auth/session/:id.
 */
async function resolveUserFromToken(accessToken: string): Promise<User> {
    const userId = getUserIdFromToken(accessToken);
    return getUserById(userId);
}

/**
 * Returns true only for HTTP responses that explicitly reject the session.
 * Network errors, timeouts, 500s, etc. are NOT auth failures.
 */
function isAuthRejection(err: unknown): boolean {
    if (err == null || typeof err !== 'object') return false;

    // Axios-style: err.response.status
    if (
        'response' in err &&
        err.response != null &&
        typeof err.response === 'object' &&
        'status' in err.response &&
        (err.response.status === 401 || err.response.status === 403)
    ) return true;

    // Flat-style: err.status
    if (
        'status' in err &&
        (err.status === 401 || err.status === 403)
    ) return true;

    return false;
}

// --- Context ---------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // FIX: Start with isLoading: false if we have a cache so there's no flicker.
    // If there's no cache, we genuinely don't know yet → keep isLoading: true.
    const cached = readCache();
    const [state, dispatch] = useReducer(
        reducer,
        cached
            ? { ...EMPTY, isAuthenticated: true, user: cached.user, role: cached.role, isLoading: true }
            : { ...EMPTY, isLoading: true },
    );

    const didInit = useRef(false);

    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;

        const restore = async () => {
            // STEP 1 — Optimistic restore: if we have a cached user, show them
            // immediately so the UI doesn't flash a login screen on every navigation.
            const hit = readCache();
            if (hit) {
                dispatch({ type: 'SET_USER', user: hit.user, role: hit.role });
            }

            // STEP 2 — Background verify: silently re-validate the session with
            // the backend using the HttpOnly refresh_token cookie.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                // FIX: Timeout does NOT logout.
                // If we already have a cached user, keep them logged in.
                // Only clear loading state so the UI isn't stuck.
                console.warn('Auth restore timed out — keeping cached session if available');
                if (!readCache()) {
                    // No cache and timed out: we genuinely have no session info.
                    dispatch({ type: 'LOGOUT' });
                }
            }, 10_000);

            try {
                const { data } = await unauthenticatedApiClient.post(
                    '/api/auth/refresh',
                    {},
                    { signal: controller.signal },
                );
                const { access_token } = data;
                const user = await resolveUserFromToken(access_token);
                const role = normalizeRole(user.role as unknown as string);

                clearTimeout(timeoutId);

                // Update cache with fresh data from server.
                writeCache(user, role);
                dispatch({ type: 'SET_USER', user, role });

            } catch (err) {
                clearTimeout(timeoutId);

                if (isAuthRejection(err)) {
                    // 401 / 403 = session is truly gone, clear everything.
                    console.info('Auth restore: session expired, logging out');
                    clearCache();
                    dispatch({ type: 'LOGOUT' });
                } else {
                    // Network error, timeout, 500, abort — server didn't reject us.
                    // Keep whatever state we have (cached user stays logged in).
                    const reason = (err as Record<string, unknown>)?.message ?? 'unknown';
                    console.warn(`Auth restore network issue (${reason}) — keeping existing session`);

                    // Reuse `hit` captured at the top — no second localStorage read needed.
                    if (!hit) {
                        // No cache at all, can't pretend to be logged in.
                        dispatch({ type: 'LOGOUT' });
                    }
                    // else: SET_USER was already dispatched in STEP 1, nothing to do.
                }
            }
        };

        void restore();
    }, []); // ← empty array: runs ONCE on mount, never on navigation

    // Listen for the global session-expired event fired by the Axios interceptor.
    useEffect(() => {
        const handler = () => {
            clearCache();
            dispatch({ type: 'LOGOUT' });
        };
        window.addEventListener('auth:session-expired', handler);
        return () => window.removeEventListener('auth:session-expired', handler);
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<UserRole> => {
        dispatch({ type: 'LOADING' });
        try {
            const { access_token } = await loginUser({ username, password });
            const user = await resolveUserFromToken(access_token);
            const role = normalizeRole(user.role as unknown as string);

            writeCache(user, role); // persist so next page load is instant
            dispatch({ type: 'SET_USER', user, role });
            return role;
        } catch (err) {
            dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Login failed' });
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        clearCache(); // wipe cache so restore doesn't resurrect the session
        try { await logoutUser(); } catch { /* intentional no-op */ }
        finally { dispatch({ type: 'LOGOUT' }); }
    }, []);

    const refresh = useCallback(async () => {
        try {
            const { access_token } = await refreshAccessToken();
            const user = await resolveUserFromToken(access_token);
            const role = normalizeRole(user.role as unknown as string);
            writeCache(user, role);
            dispatch({ type: 'SET_USER', user, role });
        } catch (err) {
            if (isAuthRejection(err)) {
                clearCache();
                dispatch({ type: 'LOGOUT' });
            }
            throw err;
        }
    }, []);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

    const hasRole = useCallback(
        (role: UserRole | UserRole[]) => {
            if (!state.role) return false;
            return Array.isArray(role) ? role.includes(state.role) : state.role === role;
        },
        [state.role],
    );

    const canAccess = useCallback(
        (required: UserRole[]) => !!state.role && required.includes(state.role),
        [state.role],
    );

    return (
        <AuthContext.Provider value={{ ...state, login, logout, refresh, clearError, hasRole, canAccess }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
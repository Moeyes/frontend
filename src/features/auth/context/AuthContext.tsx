// src/features/auth/context/AuthContext.tsx
'use client';

import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { AuthContextType, AuthState, User, UserRole } from '@/features/auth/types';
import { loginUser, logoutUser, refreshAccessToken, getUserSession } from '@/features/auth/services';
import { getStoredToken, setStoredToken, clearStoredTokens } from '@/lib/api/client';

// ─── JWT decode ───────────────────────────────────────────────────────────────
interface JwtPayload { sub: string; role: string; exp: number; }

function decodeJwt(token: string): JwtPayload | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64)) as JwtPayload;
  } catch { return null; }
}

function isExpired(token: string): boolean {
  const p = decodeJwt(token);
  return !p || Date.now() >= p.exp * 1000;
}

function normalizeRole(raw: string): UserRole {
  const map: Record<string, UserRole> = {
    'admin': UserRole.ADMIN,
    'ADMIN': UserRole.ADMIN,
    'USER1': UserRole.ORGANIZATION,
    'user1': UserRole.ORGANIZATION,
    'USER2': UserRole.FEDERATION,
    'user2': UserRole.FEDERATION,
    'GUEST': UserRole.GUEST,
    'guest': UserRole.GUEST,
  };

  const normalized = map[raw];
  if (!normalized) {
    console.warn(`Unknown role from backend: "${raw}" — defaulting to GUEST`);
  }
  return normalized ?? UserRole.GUEST;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
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
    case 'LOADING': return { ...state, isLoading: true, error: null };
    case 'SET_USER': return { ...EMPTY, isAuthenticated: true, user: action.user, role: action.role };
    case 'SET_ERROR': return { ...state, isLoading: false, error: action.error };
    case 'CLEAR_ERROR': return { ...state, error: null };
    case 'LOGOUT': return { ...EMPTY };
    default: return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...EMPTY, isLoading: true });
  const didInit = useRef(false);

  // ── Helper: fetch full user + normalize role ─────────────────────────────
  const fetchUser = useCallback(async (accessToken: string): Promise<User> => {
    const payload = decodeJwt(accessToken);
    if (!payload?.sub) throw new Error('Invalid token payload');

    const user = await getUserSession(payload.sub);

    return {
      ...user,
      role: normalizeRole(user.role as unknown as string),
    };
  }, []);

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const restore = async () => {
      const accessToken = getStoredToken();

      // No access token — try refresh via HttpOnly cookie
      if (!accessToken) {
        try {
          const refreshed = await refreshAccessToken();
          setStoredToken(refreshed.access_token);
          const user = await fetchUser(refreshed.access_token);
          dispatch({ type: 'SET_USER', user, role: user.role });
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
        return;
      }

      // Access token valid — verify with backend
      if (!isExpired(accessToken)) {
        try {
          const user = await fetchUser(accessToken);
          dispatch({ type: 'SET_USER', user, role: user.role });
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
        return;
      }

      // Access token expired — try refresh via HttpOnly cookie
      try {
        const refreshed = await refreshAccessToken();
        setStoredToken(refreshed.access_token);
        const user = await fetchUser(refreshed.access_token);
        dispatch({ type: 'SET_USER', user, role: user.role });
      } catch {
        clearStoredTokens();
        dispatch({ type: 'LOGOUT' });
      }
    };

    void restore();
  }, [fetchUser]);

  // ── login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string): Promise<UserRole> => {
    dispatch({ type: 'LOADING' });
    try {
      const { access_token } = await loginUser({ username, password });
      setStoredToken(access_token);

      const user = await fetchUser(access_token);
      dispatch({ type: 'SET_USER', user, role: user.role });
      return user.role;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', error: message });
      throw err;
    }
  }, [fetchUser]);

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch { /* best effort */ }
    finally {
      clearStoredTokens();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // ── refreshSession ───────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    const refreshed = await refreshAccessToken();
    setStoredToken(refreshed.access_token);
    const user = await fetchUser(refreshed.access_token);
    dispatch({ type: 'SET_USER', user, role: user.role });
  }, [fetchUser]);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!state.role) return false;
      return Array.isArray(role) ? role.includes(state.role) : state.role === role;
    },
    [state.role]
  );

  const canAccess = useCallback(
    (required: UserRole[]) => !!state.role && required.includes(state.role),
    [state.role]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshSession, clearError, hasRole, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
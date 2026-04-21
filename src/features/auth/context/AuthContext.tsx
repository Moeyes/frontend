'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  AuthContextType,
  AuthState,
  UserRole,
  User,
} from '@/features/auth/types';
import {
  loginUser as loginUserService,
  logoutUser as logoutUserService,
  refreshAccessToken as refreshTokenService,
} from '@/features/auth/services';
import {
  setStoredToken,
  setStoredRefreshToken,
  getStoredRefreshToken,
  getStoredToken,
  clearStoredTokens,
} from '@/lib/api/client';
import { AxiosError } from 'axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── JWT helpers ─────────────────────────────────────────────────────────────
interface JwtPayload {
  sub: string;       // user UUID
  role: string;      // "admin" | "USER1" | "USER2"
  type: string;
  exp: number;
  iat: number;
  jti?: string;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}

// Map backend role strings → frontend UserRole enum
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
  return map[raw] ?? UserRole.GUEST;
}

// Build a User from the JWT payload (no /me endpoint needed)
function userFromToken(token: string): User | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const role = normalizeRole(payload.role);
  return {
    id: payload.sub,
    username: payload.sub, // will be overwritten by stored user if available
    email: '',
    khmer_name: '',
    english_name: '',
    role,
    is_active: true,
    is_superuser: role === UserRole.ADMIN,
    created_at: '',
    updated_at: '',
  };
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// ─── Compute initial state synchronously (avoids setState-in-effect) ─────────
function resolveInitialState(): AuthState {
  const empty: AuthState = { user: null, isAuthenticated: false, isLoading: false, error: null, role: null };

  if (typeof window === 'undefined') {
    return { ...empty, isLoading: true };
  }

  const token = getStoredToken();
  if (!token || isTokenExpired(token)) {
    clearStoredTokens();
    localStorage.removeItem('auth_user');
    return empty;
  }

  // Prefer stored user (has username etc), fallback to token-only user
  const user = getStoredUser() ?? userFromToken(token);
  if (!user) {
    clearStoredTokens();
    return empty;
  }

  return { user, isAuthenticated: true, isLoading: false, error: null, role: user.role };
}
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(resolveInitialState);
  const initialized = useRef(false);

  // SSR hydration only — deferred to avoid setState-in-effect lint error
  useEffect(() => {
    if (initialized.current || !state.isLoading) return;
    initialized.current = true;
    const id = setTimeout(() => setState(resolveInitialState()), 0);
    return () => clearTimeout(id);
  }, [state.isLoading]);

  const login = useCallback(async (username: string, password: string): Promise<UserRole> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Backend returns { access_token, refresh_token, token_type }
      // There is NO user object in the response — role lives in the JWT
      const response = await loginUserService({ username, password });

      setStoredToken(response.access_token);
      setStoredRefreshToken(response.refresh_token);

      // Decode role from JWT
      const payload = decodeJwt(response.access_token);
      const role = normalizeRole(payload?.role ?? '');

      // Build user from token (no /me endpoint available)
      const user: User = {
        id: payload?.sub ?? '',
        username,     // we know this from the login form
        email: '',
        khmer_name: '',
        english_name: '',
        role,
        is_active: true,
        is_superuser: role === UserRole.ADMIN,
        created_at: '',
        updated_at: '',
      };

      localStorage.setItem('auth_user', JSON.stringify(user));

      setState({ user, isAuthenticated: true, isLoading: false, error: null, role });
      return role;
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.detail || err.message
          : err instanceof Error
            ? err.message
            : 'Login failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: typeof message === 'string' ? message : 'Login failed',
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      await logoutUserService({ refresh_token: refreshToken || undefined });
    } catch {
      // best-effort
    } finally {
      clearStoredTokens();
      localStorage.removeItem('auth_user');
      setState({ user: null, isAuthenticated: false, isLoading: false, error: null, role: null });
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return;
    try {
      const response = await refreshTokenService({ refresh_token: refreshToken });
      setStoredToken(response.access_token);
      setStoredRefreshToken(response.refresh_token);

      const payload = decodeJwt(response.access_token);
      const role = normalizeRole(payload?.role ?? '');
      const existing = getStoredUser();
      const user: User = existing
        ? { ...existing, role }
        : {
          id: payload?.sub ?? '',
          username: '',
          email: '',
          khmer_name: '',
          english_name: '',
          role,
          is_active: true,
          is_superuser: role === UserRole.ADMIN,
          created_at: '',
          updated_at: '',
        };

      localStorage.setItem('auth_user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false, error: null, role });
    } catch {
      clearStoredTokens();
      localStorage.removeItem('auth_user');
      setState({ user: null, isAuthenticated: false, isLoading: false, error: null, role: null });
    }
  }, []);

  const clearError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!state.user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  const canAccess = useCallback(
    (requiredRoles: UserRole[]) => {
      if (!state.user) return false;
      return requiredRoles.includes(state.user.role);
    },
    [state.user]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshSession, clearError, hasRole, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
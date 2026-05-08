'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { components } from '@/_contract/api.types';

// Use contract types as the source of truth (Red Line #2).
// organization_id is a frontend extension pending backend support (gap #9 in SCENARIOS.md).
type UserPublicContract = components['schemas']['UserPublic'];
export type UserRole = components['schemas']['UserRole'];

export interface AuthUser extends Omit<UserPublicContract, 'role'> {
  role: UserRole;
  organization_id: number | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getUserIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)user_id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(
    () => typeof document !== 'undefined' && !!getUserIdFromCookie()
  );

  const fetchSession = useCallback(async (userId: string): Promise<AuthUser | null> => {
    const res = await fetch(`/api/auth/session/${userId}`);
    if (!res.ok) return null;
    const data = (await res.json()) as UserPublicContract;
    return {
      ...data,
      role: (data.role as UserRole) || 'guest',
      organization_id: null, // backend gap — UserPublic doesn't include organization_id yet
    };
  }, []);

  useEffect(() => {
    const userId = getUserIdFromCookie();
    if (!userId) return;
    fetchSession(userId)
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [fetchSession]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }
    const userId = getUserIdFromCookie();
    if (userId) {
      const u = await fetchSession(userId);
      setUser(u);
    }
  }, [fetchSession]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}

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

// SEC-H5: reads user ID server-side from the HttpOnly access_token cookie.
// Never reads document.cookie — no non-HttpOnly cookie required.
async function fetchUserId(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const { userId } = await res.json() as { userId: string | null };
    return userId;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchUserId()
      .then(async (userId) => {
        if (!userId) return null;
        return fetchSession(userId);
      })
      .then((u) => setUser(u ?? null))
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
    // Read user identity via the secure server-side endpoint (SEC-H5)
    const userId = await fetchUserId();
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

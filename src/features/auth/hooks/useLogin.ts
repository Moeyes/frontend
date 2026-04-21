'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { AxiosError } from 'axios';

interface UseLoginReturn {
  login: (username: string, password: string) => Promise<UserRole | null>;
  isPending: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLogin(): UseLoginReturn {
  const { login: contextLogin } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returns UserRole on success, null on failure
  const login = useCallback(
    async (username: string, password: string): Promise<UserRole | null> => {
      setIsPending(true);
      setError(null);
      try {
        const role = await contextLogin(username, password);
        return role;
      } catch (err) {
        const message =
          err instanceof AxiosError
            ? err.response?.data?.detail || err.message
            : err instanceof Error
              ? err.message
              : 'Login failed';
        setError(typeof message === 'string' ? message : 'Login failed');
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [contextLogin]
  );

  const clearError = useCallback(() => setError(null), []);

  return { login, isPending, error, clearError };
}
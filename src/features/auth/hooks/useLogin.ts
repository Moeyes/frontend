'use client';

import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface UseLoginReturn {
  login: (username: string, password: string) => Promise<UserRole | null>;
  isPending: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLogin(): UseLoginReturn {
  const { login: contextLogin, clearError: contextClearError, error: contextError } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return await contextLogin(username, password);
    },
  });

  const login = async (username: string, password: string): Promise<UserRole | null> => {
    try {
      return await mutation.mutateAsync({ username, password });
    } catch {
      return null;
    }
  };

  const error = mutation.error 
    ? (mutation.error instanceof AxiosError 
        ? mutation.error.response?.data?.detail || mutation.error.message 
        : mutation.error instanceof Error ? mutation.error.message : 'Login failed')
    : contextError;

  return { 
    login, 
    isPending: mutation.isPending, 
    error: typeof error === 'string' ? error : 'Login failed', 
    clearError: contextClearError 
  };
}
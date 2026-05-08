import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/core/auth';
import type { LoginFormValues } from '../services/schema';

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (values: LoginFormValues) => login(values.username, values.password),
  });
}

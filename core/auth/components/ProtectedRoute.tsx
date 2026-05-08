'use client';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuthContext, type UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRoles: UserRole[];
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  requiredRoles,
  children,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!requiredRoles.includes(user.role)) {
      router.replace(redirectTo ?? '/unauthorized');
    }
  }, [user, isLoading, requiredRoles, redirectTo, router]);

  if (isLoading) return null;
  if (!user) return null;
  if (!requiredRoles.includes(user.role)) return null;

  return <>{children}</>;
}

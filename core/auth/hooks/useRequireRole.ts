'use client';
import { useAuthContext, type UserRole } from '../context/AuthContext';

export function useRequireRole(roles: UserRole[]): boolean {
  const { user } = useAuthContext();
  if (!user) return false;
  return roles.includes(user.role);
}

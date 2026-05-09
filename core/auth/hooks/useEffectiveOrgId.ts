'use client';
import { useAuth } from './useAuth';

// Gap #1 closed: UserPublic now includes organization_id from the backend session.
// Returns the current user's organization_id directly from the session.
export function useEffectiveOrgId(): number | null {
  const { user } = useAuth();
  return user?.organization_id ?? null;
}

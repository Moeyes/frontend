'use client';
import { useAuth } from './useAuth';
import { useOrgOverride } from './useOrgOverride';

// Returns the effective organization_id for the current user.
// Priority: backend-provided (UserPublic.organization_id) > user-selected override > null.
// Use this in all queries that need organization scoping instead of user.organization_id directly.
export function useEffectiveOrgId(): number | null {
  const { user }         = useAuth();
  const { overrideOrgId } = useOrgOverride();
  return user?.organization_id ?? overrideOrgId ?? null;
}

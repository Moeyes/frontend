'use client';
import { useCallback, useEffect, useState } from 'react';

const COOKIE_KEY = 'org_id_override';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function readCookie(): number | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)org_id_override=(\d+)/);
  return match ? Number(match[1]) : null;
}

function writeCookie(orgId: number | null) {
  if (typeof document === 'undefined') return;
  if (orgId) {
    document.cookie = `${COOKIE_KEY}=${orgId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
  } else {
    document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
  }
}

// Provides a user-selectable organization_id override for federation/org users
// whose session doesn't include organization_id yet (backend gap — UserPublic missing the field).
// Stored in a plain (non-HttpOnly) cookie; not a security token so this is safe.
export function useOrgOverride() {
  const [overrideOrgId, setOverrideOrgId] = useState<number | null>(() => readCookie());

  const setOrg = useCallback((orgId: number | null) => {
    writeCookie(orgId);
    setOverrideOrgId(orgId);
  }, []);

  return { overrideOrgId, setOrg };
}

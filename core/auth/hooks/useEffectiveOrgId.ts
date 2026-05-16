'use client';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const DEMO_ORG_ID_KEY   = 'demo_org_id';
const CHANGE_EVENT_NAME = 'demo-org-id-changed';

export function getDemoOrgId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(DEMO_ORG_ID_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function setDemoOrgId(id: number | null): void {
  if (typeof window === 'undefined') return;
  if (id != null && id > 0) {
    localStorage.setItem(DEMO_ORG_ID_KEY, String(id));
  } else {
    localStorage.removeItem(DEMO_ORG_ID_KEY);
  }
  // Notify all hook instances in this tab
  window.dispatchEvent(new Event(CHANGE_EVENT_NAME));
}

// Returns the current user's organization_id.
// Primary source: backend session (user.organization_id).
// Demo fallback: localStorage 'demo_org_id' — reactive to setDemoOrgId() without a page reload.
export function useEffectiveOrgId(): number | null {
  const { user } = useAuth();
  const [localOverride, setLocalOverride] = useState<number | null>(() => getDemoOrgId());

  useEffect(() => {
    const handler = () => setLocalOverride(getDemoOrgId());
    // Listen for changes from setDemoOrgId() in this tab
    window.addEventListener(CHANGE_EVENT_NAME, handler);
    // Listen for storage changes from other tabs
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  if (user?.organization_id != null) return user.organization_id;
  return localOverride;
}

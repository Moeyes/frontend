import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type RosterReport  = components['schemas']['OrgSportParticipantFullResponse'];
export type NumbersReport = components['schemas']['OrgSportParticipantExcelResponse'];
export type SportCount    = components['schemas']['SportParticipantCount'];
export type AttendedCat   = components['schemas']['AttendedCategory'];

export interface ReportParams {
  org_id:    number;
  events_id: number;
}

// RPT-ROSTER-ALL — full participant list per org+sport (GET /api/excel/org-sport)
export async function getRosterReport(params: ReportParams): Promise<RosterReport> {
  const { data, error } = await api.GET('/api/excel/org-sport', { params: { query: params } });
  if (error) throw error;
  return data;
}

// RPT-NUMBER-LIST — participant counts per sport (GET /api/excel/org-sport-participant)
export async function getNumbersReport(params: ReportParams): Promise<NumbersReport> {
  const { data, error } = await api.GET('/api/excel/org-sport-participant', {
    params: { query: params },
  });
  if (error) throw error;
  return data;
}

// Download an Excel file directly from the backend as a blob.
// Uses the native fetch API (not the typed openapi-fetch client) because we need a Blob
// response, not JSON. Goes through /api/* so Next.js middleware injects the Bearer token.
export async function downloadExcelBlob(
  path: string,
  params: ReportParams,
  filename: string
): Promise<void> {
  const qs  = new URLSearchParams({
    org_id:    String(params.org_id),
    events_id: String(params.events_id),
  });
  // Explicit credentials:'include' ensures HttpOnly cookies travel with the request.
  // The Next.js /api/* rewrite + middleware.ts then injects Authorization: Bearer <token>.
  const res = await fetch(`${path}?${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

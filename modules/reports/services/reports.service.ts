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
// The /api/excel/* endpoints likely return binary Excel (despite application/json in spec).
// The Next.js rewrite forwards to the backend with auth cookie → middleware injects Bearer token.
export async function downloadExcelBlob(
  path: string,
  params: ReportParams,
  filename: string
): Promise<void> {
  const qs  = new URLSearchParams({
    org_id:    String(params.org_id),
    events_id: String(params.events_id),
  });
  const res = await fetch(`${path}?${qs}`);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

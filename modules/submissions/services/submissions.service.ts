import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

// Submissions uses the same participation-per-sport backend endpoint as the survey module.
// The submissions module is the admin-facing review view of federation survey entries.
export type SubmissionEntry      = components['schemas']['ParticipationPerSportPublic'];
export type SubmissionListResult = components['schemas']['ParticipationPerSportPublicList'];
export type SubmissionUpdate     = components['schemas']['ParticipationPerSportUpdate'];

export interface ListSubmissionsParams {
  skip?:  number;
  limit?: number;
}

export async function listSubmissions(
  params?: ListSubmissionsParams
): Promise<SubmissionListResult> {
  const { data, error } = await api.GET('/api/participation-per-sport/', {
    params: { query: { limit: 200, ...params } },
  });
  if (error) throw error;
  return data;
}

export async function getSubmission(id: number): Promise<SubmissionEntry> {
  const { data, error } = await api.GET('/api/participation-per-sport/{id}', {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

// ⚠️ FSM transition endpoints (approve/reject/flag) do not exist yet.
// These are placeholders for when the backend adds dedicated FSM endpoints.
// DO NOT use PATCH to change status — that would violate Red Line #5.
// Kept here as documentation of what the backend needs to add.
//
// export async function approveSubmission(id: number): Promise<SubmissionEntry> {
//   return api.POST('/api/participation-per-sport/{id}/approve', ...)
// }
// export async function rejectSubmission(id: number, reason: string): Promise<SubmissionEntry> {
//   return api.POST('/api/participation-per-sport/{id}/reject', ...)
// }
// export async function flagSubmission(id: number): Promise<SubmissionEntry> {
//   return api.POST('/api/participation-per-sport/{id}/flag', ...)
// }

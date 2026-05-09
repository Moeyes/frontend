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

export async function approveSubmission(id: number): Promise<SubmissionEntry> {
  const { data, error } = await api.POST('/api/participation-per-sport/{id}/approve', {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function rejectSubmission(id: number): Promise<SubmissionEntry> {
  const { data, error } = await api.POST('/api/participation-per-sport/{id}/reject', {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function flagSubmission(id: number): Promise<SubmissionEntry> {
  const { data, error } = await api.POST('/api/participation-per-sport/{id}/flag', {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type SurveyEntry       = components['schemas']['ParticipationPerSportPublic'];
export type SurveyCreate      = components['schemas']['ParticipationPerSportCreate'];
export type SurveyUpdate      = components['schemas']['ParticipationPerSportUpdate'];
export type SurveyListResult  = components['schemas']['ParticipationPerSportPublicList'];

// Counts sub-type used across form components
export interface CountFields {
  athlete_male_count:   number;
  athlete_female_count: number;
  leader_male_count:    number;
  leader_female_count:  number;
}

export interface ListSurveyParams {
  skip?:  number;
  limit?: number;
}

export async function listSurveyEntries(params?: ListSurveyParams): Promise<SurveyListResult> {
  const { data, error } = await api.GET('/api/participation-per-sport/', {
    params: { query: params },
  });
  if (error) throw error;
  return data;
}

export async function getSurveyEntry(id: number): Promise<SurveyEntry> {
  const { data, error } = await api.GET('/api/participation-per-sport/{id}', {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function createSurveyEntry(body: SurveyCreate): Promise<SurveyEntry> {
  const { data, error } = await api.POST('/api/participation-per-sport/', { body });
  if (error) throw error;
  return data;
}

export async function updateSurveyEntry(id: number, body: SurveyUpdate): Promise<SurveyEntry> {
  const { data, error } = await api.PATCH('/api/participation-per-sport/{id}', {
    params: { path: { id } },
    body,
  });
  if (error) throw error;
  return data;
}

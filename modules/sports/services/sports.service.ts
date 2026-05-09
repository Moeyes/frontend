import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type SportPublic       = components['schemas']['SportPublic'];
export type SportCreate       = components['schemas']['SportCreate'];
export type SportUpdate       = components['schemas']['SportUpdate'];
export type SportsPublic      = components['schemas']['SportsPublic'];
export type CategoryPublic    = components['schemas']['CategoryPublic'];
export type AddCategoryBody   = components['schemas']['AddCategoryBody'];
export type UpdateCategoryBody = components['schemas']['UpdateCategoryBody'];
export type GenderEnum        = components['schemas']['genderEnum'];

export interface ListSportsParams {
  skip?: number;
  limit?: number;
}

export async function listSports(params?: ListSportsParams): Promise<SportsPublic> {
  const { data, error } = await api.GET('/api/sports/', { params: { query: params } });
  if (error) throw error;
  return data as SportsPublic;
}

export async function getSport(sportId: number): Promise<SportPublic> {
  const { data, error } = await api.GET('/api/sports/{sport_id}', {
    params: { path: { sport_id: sportId } },
  });
  if (error) throw error;
  return data;
}

export async function createSport(body: SportCreate): Promise<SportPublic> {
  const { data, error } = await api.POST('/api/sports/', { body });
  if (error) throw error;
  return data;
}

export async function updateSport(sportId: number, body: SportUpdate): Promise<SportPublic> {
  const { data, error } = await api.PUT('/api/sports/{sport_id}', {
    params: { path: { sport_id: sportId } },
    body,
  });
  if (error) throw error;
  return data;
}

export async function deleteSport(sportId: number): Promise<void> {
  const { error } = await api.DELETE('/api/sports/{sport_id}', {
    params: { path: { sport_id: sportId } },
  });
  if (error) throw error;
}

// --- Category management (categories are per event+sport) ---

export async function listCategories(
  eventId: number,
  sportId: number
): Promise<CategoryPublic[]> {
  const { data, error } = await api.GET('/api/events/{event_id}/sports/{sport_id}/categories', {
    params: { path: { event_id: eventId, sport_id: sportId } },
  });
  if (error) throw error;
  return data as CategoryPublic[];
}

export async function addCategory(body: AddCategoryBody): Promise<CategoryPublic> {
  const { data, error } = await api.POST('/api/sports/category', { body });
  if (error) throw error;
  return data;
}

export async function updateCategory(body: UpdateCategoryBody): Promise<CategoryPublic> {
  const { data, error } = await api.PATCH('/api/sports/category', { body });
  if (error) throw error;
  return data;
}

export async function deleteCategory(categoryId: number): Promise<void> {
  const { error } = await api.DELETE('/api/sports/category', {
    body: { category_id: categoryId },
  });
  if (error) throw error;
}

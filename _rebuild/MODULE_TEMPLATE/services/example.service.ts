// Replace DOMAIN and paths with actual endpoints from _contract/ENDPOINTS.md
// All types come from _contract/api.types.ts — never hand-write backend types (Red Line #2)
import { api as client } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

// Re-export the types this module uses from the contract
export type DOMAINPublic = components['schemas']['REPLACE_WITH_SCHEMA_NAME'];
export type DOMAINCreate = components['schemas']['REPLACE_WITH_CREATE_SCHEMA'];

export async function listDOMAIN(params?: { skip?: number; limit?: number }) {
  const { data, error } = await client.GET('/api/REPLACE_ME/', { params: { query: params } });
  if (error) throw error;
  return data;
}

export async function getDOMAIN(id: number) {
  const { data, error } = await client.GET('/api/REPLACE_ME/{id}', {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function createDOMAIN(body: DOMAINCreate) {
  const { data, error } = await client.POST('/api/REPLACE_ME/', { body });
  if (error) throw error;
  return data;
}

export async function updateDOMAIN(id: number, body: Partial<DOMAINCreate>) {
  const { data, error } = await client.PATCH('/api/REPLACE_ME/update', {
    body: { ...body, id },
  });
  if (error) throw error;
  return data;
}

export async function deleteDOMAIN(id: number) {
  const { data, error } = await client.DELETE('/api/REPLACE_ME/delete', {
    body: { id },
  });
  if (error) throw error;
  return data;
}

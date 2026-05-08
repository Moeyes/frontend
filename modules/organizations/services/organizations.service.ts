import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type OrganizationPublic     = components['schemas']['OrganizationPublic'];
export type OrganizationCreate     = components['schemas']['OrganizationCreate'];
export type OrganizationUpdate     = components['schemas']['OrganizationUpdate'];
export type OrganizationsPublic    = components['schemas']['OrganizationsPublic'];
export type InstituteType          = components['schemas']['instituteType'];

export const INSTITUTE_TYPES: InstituteType[] = ['province', 'ministry'];

export interface ListOrgsParams {
  skip?: number;
  limit?: number;
}

export async function listOrganizations(params?: ListOrgsParams): Promise<OrganizationsPublic> {
  const { data, error } = await api.GET('/api/organization/', { params: { query: params } });
  if (error) throw error;
  return data as OrganizationsPublic;
}

export async function getOrganization(orgId: number): Promise<OrganizationPublic> {
  const { data, error } = await api.GET('/api/organization/{org_id}', {
    params: { path: { org_id: orgId } },
  });
  if (error) throw error;
  return data;
}

export async function createOrganization(body: OrganizationCreate): Promise<OrganizationPublic> {
  const { data, error } = await api.POST('/api/organization/', { body });
  if (error) throw error;
  return data;
}

export async function updateOrganization(
  orgId: number,
  updates: OrganizationUpdate
): Promise<OrganizationPublic> {
  const { data, error } = await api.PATCH('/api/organization/update', {
    body: { org_id: orgId, data: updates },
  });
  if (error) throw error;
  return data;
}

export async function deleteOrganization(orgId: number): Promise<void> {
  const { error } = await api.DELETE('/api/organization/delete', {
    body: { org_id: orgId },
  });
  if (error) throw error;
}

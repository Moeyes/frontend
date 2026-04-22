import apiClient from '@/lib/api/client';
import { 
    Organization, 
    OrganizationCreate, 
    OrganizationUpdateBody, 
    OrganizationDeleteBody,
    OrganizationsResponse
} from '../types';

const BASE_URL = '/api/organization';

/**
 * Get all organizations
 */
export async function getOrganizations(): Promise<Organization[]> {
    const { data } = await apiClient.get<OrganizationsResponse>(`${BASE_URL}/`, {
        params: { skip: 0, limit: 100 }
    });
    return data.data;
}

/**
 * Get single organization by ID
 */
export async function getOrganizationById(orgId: number): Promise<Organization> {
    const { data } = await apiClient.get<Organization>(`${BASE_URL}/${orgId}`);
    return data;
}

/**
 * Create a new organization
 */
export async function createOrganization(orgData: OrganizationCreate): Promise<Organization> {
    const { data } = await apiClient.post<Organization>(`${BASE_URL}/`, orgData);
    return data;
}

/**
 * Update an existing organization
 */
export async function updateOrganization(orgData: OrganizationUpdateBody): Promise<Organization> {
    const { data } = await apiClient.patch<Organization>(`${BASE_URL}/update`, orgData);
    return data;
}

/**
 * Delete an organization
 */
export async function deleteOrganization(payload: OrganizationDeleteBody): Promise<void> {
    await apiClient.delete(`${BASE_URL}/delete`, { data: payload });
}

export const organizationsService = {
    getOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
};

export default organizationsService;

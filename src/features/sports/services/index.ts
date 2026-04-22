import apiClient from '@/lib/api/client';
import { 
    Sport, 
    SportCreate, 
    SportUpdate, 
    Category, 
    AddCategoryBody, 
    UpdateCategoryBody, 
    DeleteCategoryBody 
} from '../types';

const BASE_URL = '/api/sports';

/**
 * Get all sports
 */
export async function getSports(): Promise<Sport[]> {
    const response = await apiClient.get<any>(`${BASE_URL}/`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
}

/**
 * Get single sport by ID
 */
export async function getSportById(sportId: number): Promise<Sport> {
    const { data } = await apiClient.get<any>(`${BASE_URL}/${sportId}`);
    return data?.data || data;
}

/**
 * Create a new sport
 */
export async function createSport(sportData: SportCreate): Promise<Sport> {
    const { data } = await apiClient.post<any>(`${BASE_URL}/`, sportData);
    return data?.data || data;
}

/**
 * Update an existing sport
 */
export async function updateSport(sportData: SportUpdate): Promise<Sport> {
    const { id, ...payload } = sportData;
    const { data } = await apiClient.patch<any>(`${BASE_URL}/${id}`, payload);
    return data?.data || data;
}

/**
 * Get single category by ID
 */
export async function getCategoryById(categoryId: number): Promise<Category> {
    const { data } = await apiClient.get<any>(`${BASE_URL}/category/${categoryId}`);
    return data?.data || data;
}

/**
 * Add a new category to a sport
 */
export async function addCategory(categoryData: AddCategoryBody): Promise<Category> {
    const { data } = await apiClient.post<any>(`${BASE_URL}/category`, categoryData);
    return data?.data || data;
}

/**
 * Delete a category
 */
export async function deleteCategory(payload: DeleteCategoryBody): Promise<void> {
    await apiClient.delete(`${BASE_URL}/category`, { data: payload });
}

/**
 * Update a category
 */
export async function updateCategory(categoryData: UpdateCategoryBody): Promise<Category> {
    const { data } = await apiClient.patch<any>(`${BASE_URL}/category`, categoryData);
    return data?.data || data;
}

/**
 * Get categories for a specific sport
 */
export async function getCategoriesBySportId(sportId: number): Promise<Category[]> {
    const response = await apiClient.get<any>(`${BASE_URL}/${sportId}/categories`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
}

export const sportsService = {
    getSports,
    getSportById,
    createSport,
    updateSport,
    getCategoryById,
    addCategory,
    deleteCategory,
    updateCategory,
    getCategoriesBySportId,
};

export default sportsService;
